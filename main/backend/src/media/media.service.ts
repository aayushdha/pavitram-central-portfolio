import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "./storage.service";

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async recordUpload(file: Express.Multer.File, uploadedById: string | undefined) {
    const { key, url } = await this.storage.upload(file);

    const media = await this.prisma.mainMedia.create({
      data: {
        url,
        filename: key,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadedById,
      },
    });
    return media;
  }

  async list(params: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 40));

    const [items, total] = await Promise.all([
      this.prisma.mainMedia.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mainMedia.count(),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async remove(id: string) {
    const media = await this.prisma.mainMedia.findUnique({ where: { id } });
    if (!media) throw new NotFoundException("Media file not found");

    await this.storage.remove(media.filename);
    await this.prisma.mainMedia.delete({ where: { id } });
    return { message: "Media deleted" };
  }
}
