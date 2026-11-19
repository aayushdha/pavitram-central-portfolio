import { Module } from '@nestjs/common';
import { GstSummaryController } from './gst-summary.controller';
import { GstSummaryService } from './gst-summary.service';

@Module({
  controllers: [GstSummaryController],
  providers: [GstSummaryService],
})
export class GstSummaryModule {}
