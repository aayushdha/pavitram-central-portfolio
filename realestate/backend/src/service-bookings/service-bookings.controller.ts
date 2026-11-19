import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { CreateServiceBookingDto } from './dto/create-service-booking.dto';
import { UpdateServiceBookingDto } from './dto/update-service-booking.dto';
import { ServiceBookingsService } from './service-bookings.service';

@ApiTags('service-bookings')
@ApiBearerAuth()
@UseGuards(CentralAuthGuard)
@Controller('service-bookings')
export class ServiceBookingsController {
  constructor(private readonly serviceBookingsService: ServiceBookingsService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateServiceBookingDto) {
    return this.serviceBookingsService.create(user, dto);
  }

  @Get('mine/as-customer')
  findMyBookingsAsCustomer(@CurrentUser() user: RequestUser) {
    return this.serviceBookingsService.findMyBookingsAsCustomer(user.id);
  }

  @Get('mine/as-provider')
  findMyBookingsAsProvider(@CurrentUser() user: RequestUser) {
    return this.serviceBookingsService.findMyBookingsAsProvider(user.id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateServiceBookingDto,
  ) {
    return this.serviceBookingsService.updateStatus(id, user, dto);
  }
}
