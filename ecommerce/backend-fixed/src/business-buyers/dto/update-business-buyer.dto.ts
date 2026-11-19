import { PartialType } from '@nestjs/swagger';
import { CreateBusinessBuyerDto } from './create-business-buyer.dto';

export class UpdateBusinessBuyerDto extends PartialType(CreateBusinessBuyerDto) {}
