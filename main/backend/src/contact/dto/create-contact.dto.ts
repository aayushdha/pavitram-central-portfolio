import { IsString, MinLength } from "class-validator";

export class CreateContactDto {
  @IsString() @MinLength(2) name: string;
  /** Email or phone number */
  @IsString() @MinLength(3) contact: string;
  @IsString() subject: string;
  @IsString() @MinLength(3) message: string;
}
