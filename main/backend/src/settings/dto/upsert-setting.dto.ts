import { IsOptional, IsString } from "class-validator";

export class UpsertSettingDto {
  @IsString() key: string;
  @IsString() value: string;
  @IsOptional() @IsString() group?: string;
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() type?: string;
}
