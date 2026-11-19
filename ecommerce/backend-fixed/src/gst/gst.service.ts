import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GstBreakdown {
  taxType: 'Intra-State' | 'Inter-State';
  gstRate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalWithTax: number;
  vendorState: string | null;
  customerState: string | null;
}

// Doc §4.1 "Tax / GST Engine": CGST/SGST/IGST auto-calculation based on the
// vendor's origin state vs the customer's delivery destination state.
// Same state -> Intra-State -> split the rate evenly into CGST + SGST.
// Different state -> Inter-State -> the full rate goes to IGST.
@Injectable()
export class GstService {
  constructor(private readonly prisma: PrismaService) {}

  calculateBreakdown(params: {
    taxableAmount: number;
    gstRate: number;
    vendorState?: string | null;
    customerState?: string | null;
  }): GstBreakdown {
    const { taxableAmount, gstRate } = params;
    const vendorState = (params.vendorState || '').trim();
    const customerState = (params.customerState || '').trim();

    // If either state is unknown we can't determine intra vs inter-state —
    // default to Inter-State (IGST) since that's the safer/more conservative
    // assumption for compliance (never under-charge a split that requires
    // matching state registrations).
    const sameState = vendorState && customerState && vendorState.toLowerCase() === customerState.toLowerCase();

    const totalTax = round2((taxableAmount * gstRate) / 100);
    const cgst = sameState ? round2(totalTax / 2) : 0;
    const sgst = sameState ? round2(totalTax / 2) : 0;
    const igst = sameState ? 0 : totalTax;

    return {
      taxType: sameState ? 'Intra-State' : 'Inter-State',
      gstRate,
      taxableAmount: round2(taxableAmount),
      cgst,
      sgst,
      igst,
      totalTax,
      totalWithTax: round2(taxableAmount + totalTax),
      vendorState: params.vendorState || null,
      customerState: params.customerState || null,
    };
  }

  // Resolves vendor state + per-item GST rate/HSN from real data, then
  // computes and persists the breakdown onto the order. Called automatically
  // right after an order is created — failures here are logged but never
  // block order placement (tax breakdown is supplementary, not blocking).
  async calculateForOrder(orderId: string): Promise<GstBreakdown | null> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const customerState = (order.address as any)?.state || null;

    let vendorState: string | null = null;
    // BUGFIX: looked vendors up by their display NAME (order.vendor), the
    // same fragile pattern already fixed for order ownership (Order.userId/
    // vendorId) — a vendor renaming their store would silently break GST
    // calculation for all their future orders (falls back to Inter-State/
    // IGST since vendorState comes back null, which may be the wrong tax
    // split even though everything looks fine — no visible error anywhere).
    // Order.vendorId already exists (added alongside userId), so prefer it.
    if (order.vendorId) {
      const vendor = await this.prisma.vendor.findUnique({ where: { id: order.vendorId } });
      vendorState = vendor?.state || null;
    } else if (order.vendor) {
      const vendor = await this.prisma.vendor.findFirst({ where: { name: order.vendor } });
      vendorState = vendor?.state || null;
    }

    // Weighted average GST rate across the items actually ordered, when we
    // can resolve them by productId. Falls back to a flat 18% (the most
    // common slab) when items don't carry a productId (older orders, or
    // callers that only send a product name string).
    const items = (order.items as any[]) || [];
    const itemsWithProductId = items.filter((i) => i?.productId);
    let gstRate = 18;

    if (itemsWithProductId.length > 0) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: itemsWithProductId.map((i) => i.productId) } },
        select: { id: true, gstRate: true },
      });
      const rateByProductId = new Map<string, number>(products.map((p) => [p.id, Number(p.gstRate ?? 18)]));
      let weightedSum = 0;
      let weightTotal = 0;
      for (const item of itemsWithProductId) {
        const lineValue = (item.price || 0) * (item.qty || 1);
        const rate: number = rateByProductId.get(item.productId) ?? 18;
        weightedSum += lineValue * rate;
        weightTotal += lineValue;
      }
      if (weightTotal > 0) gstRate = weightedSum / weightTotal;
    }

    const breakdown = this.calculateBreakdown({
      taxableAmount: order.amount,
      gstRate,
      vendorState,
      customerState,
    });

    await this.prisma.order.update({ where: { id: orderId }, data: { taxBreakdown: breakdown as any } });
    return breakdown;
  }

  async getForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { id: true, taxBreakdown: true } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    // Lazily compute it if an older order doesn't have one stored yet.
    if (!order.taxBreakdown) return this.calculateForOrder(orderId);
    return order.taxBreakdown;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
