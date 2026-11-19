import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";
import { StorageService } from "./storage.service";

@Module({
  imports: [MulterModule.register({})],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
})
export class MediaModule {}
