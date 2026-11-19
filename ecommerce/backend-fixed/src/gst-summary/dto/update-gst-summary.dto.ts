import { PartialType } from '@nestjs/swagger';
import { CreateGstSummaryDto } from './create-gst-summary.dto';

export class UpdateGstSummaryDto extends PartialType(CreateGstSummaryDto) {}
