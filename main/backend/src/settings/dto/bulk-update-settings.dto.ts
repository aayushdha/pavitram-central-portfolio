import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UpsertSettingDto } from "./upsert-setting.dto";

export class BulkUpdateSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertSettingDto)
  settings: UpsertSettingDto[];
}
