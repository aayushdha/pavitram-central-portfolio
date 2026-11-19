import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GstService } from './gst.service';
import { CalculateGstDto } from './dto/calculate-gst.dto';

@ApiTags('gst')
@Controller('gst')
export class GstController {
  constructor(private readonly service: GstService) {}

  @Get('calculate')
  @ApiOperation({ summary: 'Ad-hoc CGST/SGST/IGST calculator — pass any amount/rate/states to preview the split' })
  calculate(@Query() dto: CalculateGstDto) {
    return this.service.calculateBreakdown({
      taxableAmount: dto.taxableAmount,
      gstRate: dto.gstRate ?? 18,
      vendorState: dto.vendorState,
      customerState: dto.customerState,
    });
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get the stored (or lazily computed) GST breakdown for a specific order' })
  getForOrder(@Param('orderId') orderId: string) {
    return this.service.getForOrder(orderId);
  }

  @Post('orders/:orderId/recalculate')
  @ApiOperation({ summary: 'Force-recompute the GST breakdown for an order (e.g. after correcting a vendor/customer state)' })
  recalculate(@Param('orderId') orderId: string) {
    return this.service.calculateForOrder(orderId);
  }
}
