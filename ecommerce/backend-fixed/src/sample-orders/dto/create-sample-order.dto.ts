import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSampleOrderDto {
  @ApiProperty()
  @IsString()
  buyer: string;

  // BUGFIX: without these, every vendor's sample-order requests were mixed
  // together with no way to scope "my sample orders" to one vendor/buyer.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buyerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiProperty()
  @IsString()
  product: string;

  @ApiProperty()
  @IsNumber()
  qty: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
