import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddTrackingEventDto } from './dto/add-tracking-event.dto';
import { GstService } from '../gst/gst.service';
import { CommissionsService } from '../commissions/commissions.service';

function todayDisplay() {
  return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function generateOrderId() {
  return `PVT-${Math.floor(10000 + Math.random() * 89999)}`;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gst: GstService,
    private readonly commissions: CommissionsService
  ) {}

  async create(dto: CreateOrderDto) {
    // BUGFIX: userId/vendorId used to be stripped out of `rest` and thrown
    // away (userId was only used transiently to clear the cart). Now they're
    // persisted on the order itself — see the schema comment on Order.
    const { id, status, date, ...rest } = dto;

    // BUGFIX: commission was never computed against the admin's actual
    // Commission Rules at all — see the schema comment on Order.commission.
    // Resolved once here (read-only against commissionRule, so it doesn't
    // need to be inside the stock transaction below) using the first
    // line item's product/category as the match target.
    let commission: number | undefined;
    try {
      const firstItem = dto.items?.[0];
      const firstProduct = firstItem?.productId
        ? await this.prisma.product.findUnique({ where: { id: firstItem.productId } })
        : null;
      const resolved = await this.commissions.resolveRate({
        vendorId: dto.vendorId,
        category: firstProduct?.category ?? undefined,
        productId: dto.items?.length === 1 ? firstItem?.productId : undefined,
        channel: dto.type,
        orderValue: dto.amount,
      });
      commission = resolved.commission;
    } catch {
      commission = undefined; // no matching/active rule, or lookup failed — leave unset rather than fail the order
    }

    // CRITICAL BUGFIX: placing an order never touched Product.stock at all.
    // Ten customers could each successfully order the last 5 units of the
    // same product — no oversell protection existed anywhere. Fixed by
    // decrementing stock inside the same transaction as order creation,
    // using a conditional update (`stock: { gte: qty }`) so two concurrent
    // orders can't both succeed against stock that only covers one of them —
    // whichever request's decrement lands first wins, the other is rejected
    // with a clear "not enough stock" error instead of silently overselling.
    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items || []) {
        if (!item.productId) continue; // no linked product (e.g. a custom/RFQ line) — nothing to decrement
        // BUGFIX: when the item is a specific variant (size/color), decrement
        // that variant's own stock — previously this always decremented the
        // parent product's aggregate stock regardless of variant, so a
        // sold-out variant's stock count never actually reflected orders
        // placed against it, and a customer could keep "buying" a variant
        // whose own stock was 0 as long as the parent product had stock left.
        if (item.variantId) {
          const updated = await tx.productVariant.updateMany({
            where: { id: item.variantId, productId: item.productId, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
          if (updated.count === 0) {
            const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
            throw new BadRequestException(
              variant
                ? `Not enough stock for "${item.product}" (${variant.name}) — only ${variant.stock} left.`
                : `Variant ${item.variantId} not found.`
            );
          }
          continue;
        }
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });
        if (updated.count === 0) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          throw new BadRequestException(
            product
              ? `Not enough stock for "${product.name}" — only ${product.stock} left.`
              : `Product ${item.productId} not found.`
          );
        }
      }

      return tx.order.create({
        data: {
          id: id || generateOrderId(),
          ...rest,
          commission,
          status: status || (dto.type === 'B2B' ? 'PO Received' : 'Pending'),
          date: date || todayDisplay(),
          trackingStatus: 'Order Placed',
          trackingHistory: [{ status: 'Order Placed', note: null, at: new Date().toISOString() }],
        },
      });
    });

    // Matches the frontend's placeOrder() behaviour: placing an order for a
    // signed-in user clears their cart.
    if (dto.userId) {
      await this.prisma.cartItem.deleteMany({ where: { userId: dto.userId } });
    }

    // Doc §4.1 "Tax / GST Engine" — auto-compute the CGST/SGST/IGST split as
    // soon as the order exists. Never let a tax-calc hiccup block the order
    // that was just placed; the order is already saved at this point.
    try {
      await this.gst.calculateForOrder(order.id);
    } catch {
      /* non-fatal — order stays valid without a tax breakdown, can be recomputed later */
    }

    return order;
  }

  async findAll(params: { search?: string; type?: string; status?: string; page?: number; limit?: number } = {}) {
    const { search, type, status, page = 1, limit = 20 } = params;
    const where: any = {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { customer: { contains: search, mode: 'insensitive' } },
              { vendor: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.order.findUnique({ where: { id }, include: { creditNotes: true } });
    if (!record) throw new NotFoundException(`Order ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    const { userId, ...rest } = dto;
    return this.prisma.order.update({ where: { id }, data: rest });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.order.delete({ where: { id } });
    return { success: true };
  }

  // Vendor (or admin) calls this to move the order forward one step, e.g.
  // "Confirmed by Vendor" + a delivery date, then later "Shipped", "Delivered".
  // Appends to trackingHistory (which the customer's order-tracking page
  // renders as a timeline) and mirrors the latest step onto trackingStatus.
  async addTrackingEvent(id: string, dto: AddTrackingEventDto) {
    const order = await this.findOne(id);
    const history = Array.isArray(order.trackingHistory) ? (order.trackingHistory as any[]) : [];
    const event = { status: dto.status, note: dto.note ?? null, at: new Date().toISOString() };
    return this.prisma.order.update({
      where: { id },
      data: {
        trackingStatus: dto.status,
        trackingHistory: [...history, event],
      },
    });
  }
}
