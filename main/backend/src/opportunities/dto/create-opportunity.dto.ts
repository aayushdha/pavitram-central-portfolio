import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateOpportunityDto {
  @IsString() slug: string;
  @IsString() title: string;
  @IsString() hindi: string;
  @IsString() label: string;
  @IsOptional() @IsString() icon?: string;
  @IsString() intro: string;
  @IsOptional() @IsArray() benefits?: string[];
  @IsOptional() @IsArray() steps?: { title: string; body: string }[];
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
