import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateSavedAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'e.g. "Home", "Work", "Other"' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ enum: ['Home', 'Work', 'Other'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Receiver name at this address' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: '10-digit contact number for delivery' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'House / flat / building, street' })
  @IsOptional()
  @IsString()
  line1?: string;

  @ApiPropertyOptional({ description: 'Area / locality' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty()
  @IsString()
  pincode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
