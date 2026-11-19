import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class CreateFaqDto {
  @IsString() question: string;
  @IsString() answer: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
