import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString } from "class-validator";
import { MainSectionType } from "@prisma/client";

export class UpsertSectionDto {
  @IsString() key: string;
  @IsOptional() @IsEnum(MainSectionType) type?: MainSectionType;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() hindi?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsObject() body?: Record<string, unknown>;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
