import { PartialType } from '@nestjs/swagger';
import { CreateContractPricingDto } from './create-contract-pricing.dto';

export class UpdateContractPricingDto extends PartialType(CreateContractPricingDto) {}
