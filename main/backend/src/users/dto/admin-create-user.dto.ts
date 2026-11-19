import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { MainRole } from "@prisma/client";

export class AdminCreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() phone: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsEnum(MainRole) role?: MainRole;
}
