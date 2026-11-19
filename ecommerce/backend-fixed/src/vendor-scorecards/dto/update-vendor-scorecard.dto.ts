import { PartialType } from '@nestjs/swagger';
import { CreateVendorScorecardDto } from './create-vendor-scorecard.dto';

export class UpdateVendorScorecardDto extends PartialType(CreateVendorScorecardDto) {}
