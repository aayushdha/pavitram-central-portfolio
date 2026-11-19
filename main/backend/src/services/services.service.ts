import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { slugify } from "../common/utils/slugify";

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // ---- Public --------------------------------------------------------------

  findAllPublic() {
    return this.prisma.mainService.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  }

  async findOnePublic(slug: string) {
    const item = await this.prisma.mainService.findFirst({ where: { slug, isPublished: true } });
    if (!item) throw new NotFoundException("Service not found");
    return item;
  }

  // ---- Admin -----------------------------------------------------------------

  findAllAdmin() {
    return this.prisma.mainService.findMany({ orderBy: { order: "asc" } });
  }

  async findOneAdmin(id: string) {
    const item = await this.prisma.mainService.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Service not found");
    return item;
  }

  async create(dto: CreateServiceDto) {
    const slug = slugify(dto.slug || dto.name);
    const existing = await this.prisma.mainService.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`A service with slug "${slug}" already exists`);

    return this.prisma.mainService.create({
      data: {
        ...dto,
        slug,
        pills: dto.pills ?? [],
        whyUs: dto.whyUs ?? [],
        features: dto.features ?? [],
        steps: dto.steps ?? [],
      } as any,
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOneAdmin(id);
    if (dto.slug) dto.slug = slugify(dto.slug);
    return this.prisma.mainService.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    await this.prisma.mainService.delete({ where: { id } });
    return { message: "Service deleted" };
  }

  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((it) => this.prisma.mainService.update({ where: { id: it.id }, data: { order: it.order } })),
    );
    return { message: "Order updated" };
  }
}
