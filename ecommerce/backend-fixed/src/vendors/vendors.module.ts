import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { StoreProfileController } from './store-profile.controller';
import { StoreProfileService } from './store-profile.service';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';

@Module({
  controllers: [VendorsController, StoreProfileController, WarehousesController],
  providers: [VendorsService, StoreProfileService, WarehousesService],
})
export class VendorsModule {}
