import { Module } from '@nestjs/common';
import { B2bInvoicesController } from './b2b-invoices.controller';
import { B2bInvoicesService } from './b2b-invoices.service';

@Module({
  controllers: [B2bInvoicesController],
  providers: [B2bInvoicesService],
})
export class B2bInvoicesModule {}
