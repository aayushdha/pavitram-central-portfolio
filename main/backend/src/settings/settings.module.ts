import { Module } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { SettingsController, AdminSettingsController } from "./settings.controller";

@Module({
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
