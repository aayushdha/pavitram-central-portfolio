import { Body, Controller, Delete, Get, Param, Put, UseGuards } from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { SettingsService } from "./settings.service";
import { UpsertSettingDto } from "./dto/upsert-setting.dto";
import { BulkUpdateSettingsDto } from "./dto/bulk-update-settings.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  findAll() {
    return this.settingsService.findAllPublicMap();
  }
}

@Controller("admin/settings")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAllAdmin();
  }

  @Put()
  upsert(@Body() dto: UpsertSettingDto) {
    return this.settingsService.upsert(dto);
  }

  @Put("bulk")
  bulkUpdate(@Body() dto: BulkUpdateSettingsDto) {
    return this.settingsService.bulkUpdate(dto);
  }

  @Delete(":key")
  remove(@Param("key") key: string) {
    return this.settingsService.remove(key);
  }
}
