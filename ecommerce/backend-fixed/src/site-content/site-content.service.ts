import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteContentService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns every section as a flat { [key]: value } map — this is what the
  // public homepage fetches once on load. Missing keys simply aren't in the
  // object; the frontend falls back to its built-in defaults for those.
  async findAllAsMap() {
    const rows = await this.prisma.siteContent.findMany();
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, any>);
  }

  findOne(key: string) {
    return this.prisma.siteContent.findUnique({ where: { key } });
  }

  upsert(key: string, value: any) {
    return this.prisma.siteContent.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async remove(key: string) {
    await this.prisma.siteContent.deleteMany({ where: { key } });
    return { success: true };
  }
}
