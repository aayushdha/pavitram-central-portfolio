import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupProxyDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
