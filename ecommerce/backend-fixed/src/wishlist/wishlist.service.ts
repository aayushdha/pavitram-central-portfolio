import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { SetPriceAlertDto } from './dto/set-price-alert.dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async add(dto: AddWishlistItemDto) {
    const { userId, productId, alertPrice } = dto;
    const existing = await this.prisma.wishlistItem.findFirst({ where: { userId: userId ?? null, productId } });
    if (existing) return existing; // idempotent — already saved
    return this.prisma.wishlistItem.create({
      data: { userId, productId, alertPrice, alertActive: alertPrice != null },
      include: { product: true },
    });
  }

  // Doc §3.1 "Wishlist & Price-Drop Alerts": customer sets a target price on
  // a saved item; this turns the alert on/off or updates the target.
  async setPriceAlert(id: string, dto: SetPriceAlertDto) {
    await this.findOne(id);
    return this.prisma.wishlistItem.update({
      where: { id },
      data: {
        alertPrice: dto.alertPrice,
        alertActive: dto.alertActive ?? dto.alertPrice != null,
        notifiedAt: null, // resets so a new target price can trigger again
      },
      include: { product: true },
    });
  }

  // Items where the current product price has fallen to/below the
  // customer's target and we haven't notified them yet.
  async priceDrops(userId?: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        userId: userId ?? null,
        alertActive: true,
        alertPrice: { not: null },
      },
      include: { product: true },
    });
    return items.filter((item) => item.product && item.alertPrice != null && item.product.price <= item.alertPrice);
  }

  // Call after sending a notification so the same drop isn't resurfaced.
  async acknowledgeDrop(id: string) {
    await this.findOne(id);
    return this.prisma.wishlistItem.update({
      where: { id },
      data: { alertActive: false, notifiedAt: new Date() },
    });
  }

  // Mirrors the frontend's toggleWishlist(): add if absent, remove if present.
  async toggle(dto: AddWishlistItemDto) {
    const { userId, productId } = dto;
    const existing = await this.prisma.wishlistItem.findFirst({ where: { userId: userId ?? null, productId } });
    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { added: false };
    }
    const created = await this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: true },
    });
    return { added: true, item: created };
  }

  // BUGFIX (critical data leak): same class of bug as cart.service.ts —
  // `userId ? { userId } : undefined` returned EVERY user's wishlist to
  // anyone whose request had no userId (guests / not-yet-loaded sessions).
  findAll(userId?: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId: userId ?? null },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.wishlistItem.findUnique({ where: { id }, include: { product: true } });
    if (!item) throw new NotFoundException(`Wishlist item ${id} not found`);
    return item;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.wishlistItem.delete({ where: { id } });
    return { success: true };
  }

  // BUGFIX (critical): destructive version of the same bug — an
  // unauthenticated "clear wishlist" call was wiping every user's wishlist
  // on the platform. Scoped to `userId ?? null` like everywhere else here.
  async clear(userId?: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId: userId ?? null } });
    return { success: true };
  }
}
