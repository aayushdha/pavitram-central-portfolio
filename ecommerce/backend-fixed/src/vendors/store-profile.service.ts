import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertStoreProfileDto } from './dto/upsert-store-profile.dto';

@Injectable()
export class StoreProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureVendor(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(`Vendor ${vendorId} not found`);
    return vendor;
  }

  async find(vendorId: string) {
    await this.ensureVendor(vendorId);
    const profile = await this.prisma.storeProfile.findUnique({
      where: { vendorId },
      include: { warehouses: true },
    });
    if (!profile) throw new NotFoundException(`Store profile not set up yet for vendor ${vendorId}`);
    return profile;
  }

  // Create-or-replace: this is what the vendor "Store Setup" screen submits
  // as a single save, so it upserts the profile and (if warehouses[] is
  // sent) fully replaces the warehouse list too.
  async upsert(vendorId: string, dto: UpsertStoreProfileDto) {
    await this.ensureVendor(vendorId);
    const { warehouses, ...rest } = dto;

    const existing = await this.prisma.storeProfile.findUnique({ where: { vendorId } });

    if (!existing) {
      return this.prisma.storeProfile.create({
        data: {
          vendorId,
          ...rest,
          ...(warehouses ? { warehouses: { create: warehouses } } : {}),
        },
        include: { warehouses: true },
      });
    }

    return this.prisma.storeProfile.update({
      where: { vendorId },
      data: {
        ...rest,
        ...(warehouses
          ? { warehouses: { deleteMany: {}, create: warehouses } }
          : {}),
      },
      include: { warehouses: true },
    });
  }

  async remove(vendorId: string) {
    await this.find(vendorId);
    await this.prisma.storeProfile.delete({ where: { vendorId } });
    return { success: true };
  }
}
