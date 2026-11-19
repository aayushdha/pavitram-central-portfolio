import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoreProfileService } from './store-profile.service';
import { UpsertStoreProfileDto } from './dto/upsert-store-profile.dto';

@ApiTags('vendors / store-profile')
@Controller('vendors/:vendorId/store-profile')
export class StoreProfileController {
  constructor(private readonly service: StoreProfileService) {}

  @Get()
  find(@Param('vendorId') vendorId: string) {
    return this.service.find(vendorId);
  }

  @Post()
  @ApiOperation({ summary: 'Create or fully replace the store profile (and its warehouses, if sent) for a vendor' })
  upsert(@Param('vendorId') vendorId: string, @Body() dto: UpsertStoreProfileDto) {
    return this.service.upsert(vendorId, dto);
  }

  @Put()
  @ApiOperation({ summary: 'Same as POST — create or fully replace the store profile' })
  replace(@Param('vendorId') vendorId: string, @Body() dto: UpsertStoreProfileDto) {
    return this.service.upsert(vendorId, dto);
  }

  @Delete()
  remove(@Param('vendorId') vendorId: string) {
    return this.service.remove(vendorId);
  }
}
