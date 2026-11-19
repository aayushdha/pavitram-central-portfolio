import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateStatDto {
  @IsString() label: string;
  @IsString() value: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
