import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { UploadQueryDto } from './dto/upload-query.dto';

@ApiTags('storage / uploads')
@Controller('uploads')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload a single file to MinIO/S3 (product images, KYC docs, banner images, etc.)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOne(@UploadedFile() file: Express.Multer.File, @Query() query: UploadQueryDto) {
    const { key, url } = await this.storageService.uploadFile(file, query.folder || 'uploads');
    return this.prisma.uploadedFile.create({
      data: {
        key,
        url,
        mimeType: file.mimetype,
        size: file.size,
        folder: query.folder || 'uploads',
      },
    });
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files in one request (up to 10)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMany(@UploadedFiles() files: Express.Multer.File[], @Query() query: UploadQueryDto) {
    const results = [];
    for (const file of files) {
      const { key, url } = await this.storageService.uploadFile(file, query.folder || 'uploads');
      results.push(
        await this.prisma.uploadedFile.create({
          data: {
            key,
            url,
            mimeType: file.mimetype,
            size: file.size,
            folder: query.folder || 'uploads',
          },
        }),
      );
    }
    return results;
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded files (optionally filter by folder)' })
  findAll(@Query('folder') folder?: string) {
    return this.prisma.uploadedFile.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file from storage and remove its record' })
  async remove(@Param('id') id: string) {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    await this.storageService.deleteFile(file.key);
    await this.prisma.uploadedFile.delete({ where: { id } });
    return { success: true };
  }
}
