import { PartialType } from '@nestjs/swagger';
import { CreateB2bInvoiceDto } from './create-b2b-invoice.dto';

export class UpdateB2bInvoiceDto extends PartialType(CreateB2bInvoiceDto) {}
