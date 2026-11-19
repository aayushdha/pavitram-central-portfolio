import { IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() profession?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() organization?: string;
  @IsOptional() @IsString() reference?: string;
}
