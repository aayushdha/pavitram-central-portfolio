import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateFaqDto } from "./dto/create-faq.dto";
import { UpdateFaqDto } from "./dto/update-faq.dto";

@Injectable()
export class FaqsService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.mainFaq.findMany({ where: { isPublished: true }, orderBy: { order: "asc" } });
  }

  findAllAdmin() {
    return this.prisma.mainFaq.findMany({ orderBy: { order: "asc" } });
  }

  async findOne(id: string) {
    const item = await this.prisma.mainFaq.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("FAQ not found");
    return item;
  }

  create(dto: CreateFaqDto) {
    return this.prisma.mainFaq.create({ data: dto });
  }

  async update(id: string, dto: UpdateFaqDto) {
    await this.findOne(id);
    return this.prisma.mainFaq.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.mainFaq.delete({ where: { id } });
    return { message: "FAQ deleted" };
  }

  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((it) => this.prisma.mainFaq.update({ where: { id: it.id }, data: { order: it.order } })),
    );
    return { message: "Order updated" };
  }
}
