import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadQueryDto {
  @ApiPropertyOptional({ description: 'Logical folder inside the bucket, e.g. products, kyc, banners', default: 'uploads' })
  @IsOptional()
  @IsString()
  folder?: string;
}
