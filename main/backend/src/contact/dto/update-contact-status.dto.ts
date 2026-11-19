import { IsEnum } from "class-validator";
import { MainMessageStatus } from "@prisma/client";

export class UpdateContactStatusDto {
  @IsEnum(MainMessageStatus) status: MainMessageStatus;
}
