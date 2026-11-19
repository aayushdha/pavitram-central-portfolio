import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOpportunityDto } from "./dto/create-opportunity.dto";
import { UpdateOpportunityDto } from "./dto/update-opportunity.dto";
import { slugify } from "../common/utils/slugify";

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.mainOpportunity.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
    });
  }

  async findOnePublic(slug: string) {
    const item = await this.prisma.mainOpportunity.findFirst({ where: { slug, isPublished: true } });
    if (!item) throw new NotFoundException("Opportunity not found");
    return item;
  }

  findAllAdmin() {
    return this.prisma.mainOpportunity.findMany({ orderBy: { order: "asc" } });
  }

  async findOneAdmin(id: string) {
    const item = await this.prisma.mainOpportunity.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Opportunity not found");
    return item;
  }

  async create(dto: CreateOpportunityDto) {
    const slug = slugify(dto.slug || dto.title);
    const existing = await this.prisma.mainOpportunity.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`An opportunity with slug "${slug}" already exists`);

    return this.prisma.mainOpportunity.create({
      data: { ...dto, slug, benefits: dto.benefits ?? [], steps: dto.steps ?? [] } as any,
    });
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    await this.findOneAdmin(id);
    if (dto.slug) dto.slug = slugify(dto.slug);
    return this.prisma.mainOpportunity.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOneAdmin(id);
    await this.prisma.mainOpportunity.delete({ where: { id } });
    return { message: "Opportunity deleted" };
  }

  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.mainOpportunity.update({ where: { id: it.id }, data: { order: it.order } }),
      ),
    );
    return { message: "Order updated" };
  }
}
