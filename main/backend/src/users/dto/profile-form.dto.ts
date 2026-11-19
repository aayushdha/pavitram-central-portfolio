import { IsOptional, IsString, MinLength } from "class-validator";

/** "Join the Community" membership application — public endpoint. */
export class ProfileFormDto {
  @IsString() @MinLength(2) fullName: string;
  @IsString() @MinLength(7) mobileNumber: string;
  @IsString() profession: string;
  @IsString() designation: string;
  @IsString() organization: string;
  @IsString() location: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsOptional() @IsString() reference?: string;
}
