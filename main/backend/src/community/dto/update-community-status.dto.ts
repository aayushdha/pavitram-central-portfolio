import { IsEnum, IsOptional, IsString } from "class-validator";
import { MainCommunityStatus } from "@prisma/client";

export class UpdateCommunityStatusDto {
  @IsEnum(MainCommunityStatus) status: MainCommunityStatus;
  @IsOptional() @IsString() notes?: string;
}
