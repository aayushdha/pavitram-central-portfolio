import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { GstModule } from '../gst/gst.module';
import { CommissionsModule } from '../commissions/commissions.module';

@Module({
  imports: [GstModule, CommissionsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
