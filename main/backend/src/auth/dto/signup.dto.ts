import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class SignupDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @IsString()
  @Matches(/^[0-9+\-\s]{7,15}$/, { message: "Please provide a valid phone number" })
  phone: string;
}
