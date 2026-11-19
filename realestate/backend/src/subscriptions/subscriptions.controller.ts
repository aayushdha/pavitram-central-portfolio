import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { SubscribeDto } from './dto/subscribe.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(CentralAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('mine')
  findMine(@CurrentUser() user: RequestUser) {
    return this.subscriptionsService.findMine(user.id);
  }

  @Post()
  subscribe(@CurrentUser() user: RequestUser, @Body() dto: SubscribeDto) {
    return this.subscriptionsService.subscribe(user.id, dto);
  }
}
