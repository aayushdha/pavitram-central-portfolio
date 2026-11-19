import { IsEnum, IsOptional, IsString } from "class-validator";
import { MainAccountStatus, MainKycStatus, MainRole } from "@prisma/client";

export class AdminUpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(MainRole) role?: MainRole;
  @IsOptional() @IsEnum(MainAccountStatus) accountStatus?: MainAccountStatus;
  @IsOptional() @IsEnum(MainKycStatus) kycStatus?: MainKycStatus;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() profession?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() organization?: string;
}
