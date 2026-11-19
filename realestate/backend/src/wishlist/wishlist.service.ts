import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, propertyId: string) {
    const property = await this.prisma.realProperty.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const item = await this.prisma.realWishlistItem.upsert({
      where: { userId_propertyId: { userId, propertyId } },
      create: { userId, propertyId },
      update: {},
    });

    await this.prisma.realProperty.update({
      where: { id: propertyId },
      data: { shortlists: { increment: 1 } },
    });

    return { message: 'Added to wishlist', item };
  }

  async remove(userId: string, propertyId: string) {
    await this.prisma.realWishlistItem.deleteMany({ where: { userId, propertyId } });
    return { message: 'Removed from wishlist' };
  }

  async findMine(userId: string) {
    const items = await this.prisma.realWishlistItem.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  }
}
