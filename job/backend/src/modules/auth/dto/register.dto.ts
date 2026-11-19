import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Roles a person can self-select at signup. ADMIN is never allowed here. */
export const SELF_SERVICE_ROLES = ['SEEKER', 'EMPLOYER'] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export class RegisterDto {
  @ApiPropertyOptional({ example: 'Rahul Shah' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'rahul@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MyPass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '9876543210' })
  @Matches(/^[0-9]{10}$/, { message: 'phone must be a 10-digit number' })
  phone: string;

  @ApiPropertyOptional({
    enum: SELF_SERVICE_ROLES,
    default: 'SEEKER',
    description: 'How this user wants to use the platform. Defaults to SEEKER.',
  })
  @IsOptional()
  @IsIn(SELF_SERVICE_ROLES)
  role?: SelfServiceRole;
}
