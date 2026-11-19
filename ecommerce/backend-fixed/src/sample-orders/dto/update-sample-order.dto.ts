import { PartialType } from '@nestjs/swagger';
import { CreateSampleOrderDto } from './create-sample-order.dto';

export class UpdateSampleOrderDto extends PartialType(CreateSampleOrderDto) {}
