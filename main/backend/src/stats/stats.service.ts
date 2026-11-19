import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStatDto } from "./dto/create-stat.dto";
import { UpdateStatDto } from "./dto/update-stat.dto";

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.mainStat.findMany({ where: { isPublished: true }, orderBy: { order: "asc" } });
  }

  findAllAdmin() {
    return this.prisma.mainStat.findMany({ orderBy: { order: "asc" } });
  }

  async findOne(id: string) {
    const item = await this.prisma.mainStat.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Stat not found");
    return item;
  }

  create(dto: CreateStatDto) {
    return this.prisma.mainStat.create({ data: dto });
  }

  async update(id: string, dto: UpdateStatDto) {
    await this.findOne(id);
    return this.prisma.mainStat.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.mainStat.delete({ where: { id } });
    return { message: "Stat deleted" };
  }

  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((it) => this.prisma.mainStat.update({ where: { id: it.id }, data: { order: it.order } })),
    );
    return { message: "Order updated" };
  }
}
