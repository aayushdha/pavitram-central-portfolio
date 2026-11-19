import { IsEmail, IsString } from 'class-validator';

export class SigninProxyDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
