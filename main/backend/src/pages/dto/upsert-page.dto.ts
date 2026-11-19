import { IsOptional, IsString } from "class-validator";

export class UpsertPageDto {
  @IsString() slug: string;
  @IsString() title: string;
  @IsOptional() @IsString() hindi?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() metaDescription?: string;
}
