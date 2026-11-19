import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';

@ApiTags('commissions')
@Controller()
export class CommissionsController {
  constructor(private readonly service: CommissionsService) {}

  // ---- Rules ----
  @Post('commission-rules')
  createRule(@Body() dto: CreateCommissionRuleDto) {
    return this.service.createRule(dto);
  }

  @Get('commission-rules')
  findAllRules(@Query('scope') scope?: string, @Query('channel') channel?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAllRules({ scope, channel, page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
  }

  @Get('commission-rules/resolve')
  resolveRate(
    @Query('channel') channel: string,
    @Query('orderValue') orderValue: string,
    @Query('vendorId') vendorId?: string,
    @Query('category') category?: string,
    @Query('productId') productId?: string,
  ) {
    return this.service.resolveRate({ channel, orderValue: Number(orderValue), vendorId, category, productId });
  }

  @Get('commission-rules/:id')
  findOneRule(@Param('id') id: string) {
    return this.service.findOneRule(id);
  }

  @Patch('commission-rules/:id')
  updateRule(@Param('id') id: string, @Body() dto: UpdateCommissionRuleDto) {
    return this.service.updateRule(id, dto);
  }

  @Delete('commission-rules/:id')
  removeRule(@Param('id') id: string) {
    return this.service.removeRule(id);
  }

  // ---- Payouts ----
  @Post('payouts')
  createPayout(@Body() dto: CreatePayoutDto) {
    return this.service.createPayout(dto);
  }

  @Get('payouts')
  findAllPayouts(@Query('vendorId') vendorId?: string, @Query('status') status?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAllPayouts({ vendorId, status, page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined });
  }

  @Get('payouts/:id')
  findOnePayout(@Param('id') id: string) {
    return this.service.findOnePayout(id);
  }

  @Patch('payouts/:id')
  updatePayout(@Param('id') id: string, @Body() dto: UpdatePayoutDto) {
    return this.service.updatePayout(id, dto);
  }

  @Delete('payouts/:id')
  removePayout(@Param('id') id: string) {
    return this.service.removePayout(id);
  }
}
