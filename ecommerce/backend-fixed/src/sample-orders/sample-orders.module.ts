import { Module } from '@nestjs/common';
import { SampleOrdersController } from './sample-orders.controller';
import { SampleOrdersService } from './sample-orders.service';

@Module({
  controllers: [SampleOrdersController],
  providers: [SampleOrdersService],
})
export class SampleOrdersModule {}
