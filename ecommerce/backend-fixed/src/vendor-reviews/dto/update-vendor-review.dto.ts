import { PartialType } from '@nestjs/swagger';
import { CreateVendorReviewDto } from './create-vendor-review.dto';

export class UpdateVendorReviewDto extends PartialType(CreateVendorReviewDto) {}
