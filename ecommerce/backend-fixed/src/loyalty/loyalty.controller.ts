import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { EarnPointsDto } from './dto/earn-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

@ApiTags('loyalty')
@Controller()
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @Get('loyalty/:userId')
  getAccount(@Param('userId') userId: string) {
    return this.service.getAccount(userId);
  }

  @Post('loyalty/earn')
  earn(@Body() dto: EarnPointsDto) {
    return this.service.earn(dto);
  }

  @Post('loyalty/redeem')
  redeem(@Body() dto: RedeemPointsDto) {
    return this.service.redeem(dto);
  }

  @Post('referrals')
  createReferral(@Body() dto: CreateReferralDto) {
    return this.service.createReferral(dto);
  }

  @Get('referrals')
  listReferrals(@Query('userId') userId?: string) {
    return this.service.listReferrals({ userId });
  }

  @Patch('referrals/:id')
  updateReferral(@Param('id') id: string, @Body() dto: UpdateReferralDto) {
    return this.service.updateReferral(id, dto);
  }
}
