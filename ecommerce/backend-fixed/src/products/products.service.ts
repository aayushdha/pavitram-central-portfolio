import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// ---------------------------------------------------------------------------
// Lightweight typo-tolerant search ranking (Doc §3.1 "Elastic Search &
// Auto-Suggestions"). This is NOT a real Elasticsearch/Meilisearch cluster —
// that needs its own hosted search service, which is tracked separately as
// infrastructure the client needs to provision. What this DOES give: results
// still show up even with a small typo ("bansmati" -> "basmati"), ranked by
// relevance, using nothing beyond the existing Postgres database. It scales
// fine for a catalog of hundreds of products; a large catalog (thousands+)
// would want real Elasticsearch instead.
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// Higher score = more relevant. Combines exact-substring matches (cheap, and
// a strong signal) with fuzzy word-level matches (catches typos).
function relevanceScore(product: { name: string; description?: string | null; category?: string | null; vendor?: string | null }, queryWords: string[]): number {
  const fields = [
    { text: (product.name || '').toLowerCase(), weight: 3 },
    { text: (product.category || '').toLowerCase(), weight: 2 },
    { text: (product.vendor || '').toLowerCase(), weight: 1.5 },
    { text: (product.description || '').toLowerCase(), weight: 1 },
  ];
  let score = 0;
  for (const word of queryWords) {
    for (const field of fields) {
      if (!field.text) continue;
      if (field.text.includes(word)) {
        score += field.weight * 2; // exact substring — strong signal
        continue;
      }
      // Fuzzy fallback: does any word in this field closely match (typo-tolerant)?
      const fieldWords = field.text.split(/\s+/);
      for (const fw of fieldWords) {
        if (fw.length < 3) continue;
        const distance = levenshtein(word, fw);
        const tolerance = word.length <= 4 ? 1 : 2; // shorter words get less tolerance
        if (distance <= tolerance) {
          score += field.weight * (1 - distance / (tolerance + 1));
        }
      }
    }
  }
  return score;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProductDto) {
    const { tierPricing, variants, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        // Every new listing goes to moderation first — a vendor cannot
        // publish straight to the storefront by setting status themselves
        // from the vendor-facing product form (only the admin endpoints do).
        status: 'Pending',
        rejectionReason: null,
        ...(tierPricing
          ? { tierPricing: { create: tierPricing.map((t) => ({ min: t.min, max: t.max ?? null, price: t.price })) } }
          : {}),
        ...(variants
          ? { variants: { create: variants.map((v) => ({ name: v.name, sku: v.sku, price: v.price, stock: v.stock ?? 0 })) } }
          : {}),
      },
      include: { tierPricing: true, variants: true },
    });
  }

  async findAll(params: {
    search?: string;
    category?: string;
    vendorId?: string;
    channel?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { search, category, vendorId, channel, status, page = 1, limit = 20 } = params;
    const baseWhere: any = {
      ...(category ? { category } : {}),
      ...(vendorId ? { vendorId } : {}),
      ...(channel ? { channels: { has: channel } } : {}),
      // Storefront calls MUST pass status=Approved explicitly (see products
      // controller doc comment) — admin/vendor screens omit this to see everything.
      ...(status ? { status } : {}),
    };

    if (!search || !search.trim()) {
      const [data, total] = await Promise.all([
        this.prisma.product.findMany({
          where: baseWhere,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { tierPricing: true, variants: true },
        }),
        this.prisma.product.count({ where: baseWhere }),
      ]);
      return { data, total, page, limit };
    }

    // Typo-tolerant search: pull every product matching the non-search
    // filters (category/vendor/channel/status), rank them by relevance in
    // application code, then paginate the ranked list. See relevanceScore()
    // above for what "Elastic-grade" means here without a real search cluster.
    const queryWords = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const candidates = await this.prisma.product.findMany({
      where: baseWhere,
      include: { tierPricing: true, variants: true },
    });

    const ranked = candidates
      .map((product) => ({ product, score: relevanceScore(product, queryWords) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || (b.product.rating || 0) - (a.product.rating || 0));

    const total = ranked.length;
    const data = ranked.slice((page - 1) * limit, (page - 1) * limit + limit).map((r) => r.product);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.product.findUnique({ where: { id }, include: { tierPricing: true, variants: true } });
    if (!record) throw new NotFoundException(`Product ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { tierPricing, variants, status, rejectionReason, ...rest } = dto;

    // Two different callers hit this same endpoint:
    //  - the admin "Product Approvals" screen, which sends ONLY
    //    { status, rejectionReason } to approve/reject a listing
    //  - a vendor editing their own product (price/stock/description/...),
    //    which never sends `status` at all
    // If `status` is present in the payload, trust it as-is (admin decision).
    // If it's absent, the vendor changed something material — send the
    // listing back to "Pending" so admin re-reviews before it's shown again.
    const statusUpdate =
      status !== undefined ? { status, rejectionReason: status === 'Rejected' ? rejectionReason ?? null : null } : { status: 'Pending', rejectionReason: null };

    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...statusUpdate,
        // Passing tierPricing on update fully replaces the existing slab list
        // (delete-all-then-recreate), which matches how the frontend edits
        // a product's whole tier table in one save.
        ...(tierPricing
          ? {
              tierPricing: {
                deleteMany: {},
                create: tierPricing.map((t) => ({ min: t.min, max: t.max ?? null, price: t.price })),
              },
            }
          : {}),
        // Same fully-replace semantics as tierPricing above, matching how
        // the frontend edits a product's whole variant list in one save.
        ...(variants
          ? {
              variants: {
                deleteMany: {},
                create: variants.map((v) => ({ name: v.name, sku: v.sku, price: v.price, stock: v.stock ?? 0 })),
              },
            }
          : {}),
      },
      include: { tierPricing: true, variants: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
