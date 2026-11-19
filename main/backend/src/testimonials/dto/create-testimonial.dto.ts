import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateTestimonialDto {
  @IsString() name: string;
  @IsOptional() @IsString() role?: string;
  @IsString() quote: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
