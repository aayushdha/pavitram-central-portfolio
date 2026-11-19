import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WarehouseDto } from './dto/warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureStoreProfile(vendorId: string) {
    const profile = await this.prisma.storeProfile.findUnique({ where: { vendorId } });
    if (!profile) {
      throw new NotFoundException(
        `Vendor ${vendorId} has no store profile yet — create one via POST /vendors/${vendorId}/store-profile first`,
      );
    }
    return profile;
  }

  async findAll(vendorId: string) {
    const profile = await this.ensureStoreProfile(vendorId);
    return this.prisma.warehouse.findMany({ where: { storeProfileId: profile.id } });
  }

  async create(vendorId: string, dto: WarehouseDto) {
    const profile = await this.ensureStoreProfile(vendorId);
    return this.prisma.warehouse.create({ data: { ...dto, storeProfileId: profile.id } });
  }

  async update(vendorId: string, warehouseId: string, dto: Partial<WarehouseDto>) {
    await this.ensureWarehouse(vendorId, warehouseId);
    return this.prisma.warehouse.update({ where: { id: warehouseId }, data: dto });
  }

  async remove(vendorId: string, warehouseId: string) {
    await this.ensureWarehouse(vendorId, warehouseId);
    await this.prisma.warehouse.delete({ where: { id: warehouseId } });
    return { success: true };
  }

  private async ensureWarehouse(vendorId: string, warehouseId: string) {
    const profile = await this.ensureStoreProfile(vendorId);
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: warehouseId, storeProfileId: profile.id },
    });
    if (!warehouse) throw new NotFoundException(`Warehouse ${warehouseId} not found for vendor ${vendorId}`);
    return warehouse;
  }
}
