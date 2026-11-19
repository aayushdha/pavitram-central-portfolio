import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { CentralAuthGuard } from '../common/guards/central-auth.guard';
import { MinioService } from './minio.service';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
]);
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly minio: MinioService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Uploads one image (field name "file") to MinIO and returns a URL the
   * client can use directly in `images: string[]` on properties/projects.
   * The URL points BACK at this backend (`/storage/file/:key`), which
   * proxies the download from MinIO — so the bucket itself never needs to
   * be public and no extra nginx/DNS setup is required.
   */
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(CentralAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file was uploaded — send it as multipart/form-data under the field name "file".');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WebP, AVIF.`);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File is larger than 8MB.');
    }

    const key = await this.minio.upload(file.buffer, file.originalname, file.mimetype);
    // BACKEND_PUBLIC_URL is deliberately the bare origin (no path) — it's
    // also reused for CORS_ORIGINS elsewhere, where a path suffix would be
    // wrong — so this backend's global `api/v1` prefix (see `main.ts`) is
    // appended here explicitly.
    const backendPublicUrl = this.config.get<string>('BACKEND_PUBLIC_URL', 'http://localhost:4000');
    return {
      message: 'File uploaded successfully',
      key,
      url: `${backendPublicUrl}/api/v1/storage/file/${key}`,
    };
  }

  /** Public — streams the image back out. No auth, same as any other public image URL. */
  @Get('file/:key')
  async getFile(@Param('key') key: string, @Res() res: Response) {
    try {
      const stat = await this.minio.statObject(key);
      const stream = await this.minio.getObjectStream(key);
      res.setHeader('Content-Type', stat.metaData?.['content-type'] ?? 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      stream.pipe(res);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
