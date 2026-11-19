import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class SetPriceAlertDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  alertPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  alertActive?: boolean;
}
