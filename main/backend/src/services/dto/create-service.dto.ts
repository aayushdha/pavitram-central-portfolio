import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateServiceDto {
  @IsString() slug: string;
  @IsString() name: string;
  @IsString() hindi: string;
  @IsString() tagline: string;
  @IsOptional() @IsString() heroIcon?: string;
  @IsString() aboutTitle: string;
  @IsString() aboutP1: string;
  @IsString() aboutP2: string;
  @IsOptional() @IsArray() pills?: string[];
  @IsOptional() @IsArray() whyUs?: string[];
  @IsOptional() @IsArray() features?: { icon: string; title: string; desc: string }[];
  @IsOptional() @IsArray() steps?: { num: string; title: string; desc: string }[];
  @IsOptional() @IsString() dashboardDescription?: string;
  @IsOptional() @IsString() dashboardHref?: string;
  @IsOptional() @IsBoolean() dashboardExternal?: boolean;
  @IsOptional() @IsBoolean() dashboardSso?: boolean;
  @IsOptional() @IsString() dashboardAccent?: string;
  @IsOptional() @IsBoolean() showOnDashboard?: boolean;
  @IsOptional() @IsString() metaDescription?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
