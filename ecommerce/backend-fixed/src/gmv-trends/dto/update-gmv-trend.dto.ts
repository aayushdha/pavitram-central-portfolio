import { PartialType } from '@nestjs/swagger';
import { CreateGmvTrendDto } from './create-gmv-trend.dto';

export class UpdateGmvTrendDto extends PartialType(CreateGmvTrendDto) {}
