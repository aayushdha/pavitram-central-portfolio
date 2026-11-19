import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export const USER_ROLES = ['admin', 'vendor', 'b2b', 'customer'] as const;

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Stored as-is by this endpoint — hash it upstream if exposing this publicly. No login/signup API is provided by this backend.' })
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty({ enum: USER_ROLES })
  @IsIn(USER_ROLES as unknown as string[])
  role: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buyerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
