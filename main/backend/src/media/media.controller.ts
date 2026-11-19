import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { MainRole } from "@prisma/client";
import { MediaService } from "./media.service";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

const ALLOWED_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"];

@Controller("admin/media")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      // Buffer stays in memory just long enough to stream straight to MinIO —
      // nothing is ever written to the VPS's local disk.
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(new BadRequestException("Only image files are allowed (png, jpg, webp, svg, gif)"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 8) * 1024 * 1024 },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser("userId") userId: string) {
    if (!file) throw new BadRequestException("No file uploaded");
    return this.mediaService.recordUpload(file, userId);
  }

  @Get()
  list(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.mediaService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.mediaService.remove(id);
  }
}
