import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Mirrors the frontend's addToCart(): if the same product+variant already
  // sits in this user's cart, bump its qty instead of creating a duplicate row.
  async add(dto: AddCartItemDto) {
    const { userId, productId, variantId = null, qty = 1 } = dto;

    const existing = await this.prisma.cartItem.findFirst({
      where: { userId: userId ?? null, productId, variantId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + qty },
        include: { product: { include: { tierPricing: true, variants: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, variantId, qty },
      include: { product: { include: { tierPricing: true, variants: true } } },
    });
  }

  // BUGFIX (critical data leak): `userId ? { userId } : undefined` meant that
  // whenever userId was falsy (e.g. a guest, or a logged-out visitor whose
  // frontend session hadn't loaded yet), the `where` clause became
  // `undefined` — which to Prisma means "no filter at all". That returned
  // EVERY cart item belonging to EVERY user on the entire platform to
  // whoever asked. Scoping to `userId ?? null` (matching how add() already
  // treats guest items) keeps this to only that caller's own rows.
  findAll(userId?: string) {
    return this.prisma.cartItem.findMany({
      where: { userId: userId ?? null },
      include: { product: { include: { tierPricing: true, variants: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id },
      include: { product: { include: { tierPricing: true, variants: true } } },
    });
    if (!item) throw new NotFoundException(`Cart item ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateCartItemDto) {
    await this.findOne(id);
    if (dto.qty <= 0) {
      await this.prisma.cartItem.delete({ where: { id } });
      return { success: true, removed: true };
    }
    return this.prisma.cartItem.update({
      where: { id },
      data: { qty: dto.qty },
      include: { product: { include: { tierPricing: true, variants: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.cartItem.delete({ where: { id } });
    return { success: true };
  }

  // BUGFIX (critical): same bug as findAll() above, but destructive — an
  // unauthenticated/guest request to "clear my cart" was deleting every
  // cart item for every user on the platform, since `undefined` matches
  // all rows in Prisma. Scoped to `userId ?? null` so it only ever clears
  // the caller's own (or their own guest-session) items.
  async clear(userId?: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId: userId ?? null } });
    return { success: true };
  }
}
