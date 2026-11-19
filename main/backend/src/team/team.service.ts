import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.mainTeamMember.findMany({ where: { isPublished: true }, orderBy: { order: "asc" } });
  }

  findAllAdmin() {
    return this.prisma.mainTeamMember.findMany({ orderBy: { order: "asc" } });
  }

  async findOne(id: string) {
    const item = await this.prisma.mainTeamMember.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Team member not found");
    return item;
  }

  create(dto: CreateTeamMemberDto) {
    return this.prisma.mainTeamMember.create({ data: dto });
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    await this.findOne(id);
    return this.prisma.mainTeamMember.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.mainTeamMember.delete({ where: { id } });
    return { message: "Team member deleted" };
  }

  async reorder(items: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      items.map((it) => this.prisma.mainTeamMember.update({ where: { id: it.id }, data: { order: it.order } })),
    );
    return { message: "Order updated" };
  }
}
