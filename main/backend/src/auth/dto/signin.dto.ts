import { IsString, MinLength } from "class-validator";

export class SigninDto {
  /** Email or phone number */
  @IsString()
  identifier: string;

  @IsString()
  @MinLength(1)
  password: string;
}
