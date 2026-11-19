import { Injectable, NotFoundException } from "@nestjs/common";
import { MainCommunityStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateCommunityStatusDto } from "./dto/update-community-status.dto";

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async list(params: { page?: number; limit?: number; status?: MainCommunityStatus; search?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: "insensitive" } },
        { mobileNumber: { contains: params.search, mode: "insensitive" } },
        { organization: { contains: params.search, mode: "insensitive" } },
        { city: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [items, total, pending, approved, rejected] = await Promise.all([
      this.prisma.mainCommunityMember.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mainCommunityMember.count({ where }),
      this.prisma.mainCommunityMember.count({ where: { status: "PENDING" } }),
      this.prisma.mainCommunityMember.count({ where: { status: "APPROVED" } }),
      this.prisma.mainCommunityMember.count({ where: { status: "REJECTED" } }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      counts: { pending, approved, rejected, total },
    };
  }

  async get(id: string) {
    const item = await this.prisma.mainCommunityMember.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Community application not found");
    return item;
  }

  async updateStatus(id: string, dto: UpdateCommunityStatusDto, adminId: string) {
    const item = await this.prisma.mainCommunityMember.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Community application not found");

    return this.prisma.mainCommunityMember.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.mainCommunityMember.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Community application not found");
    await this.prisma.mainCommunityMember.delete({ where: { id } });
    return { message: "Application deleted" };
  }
}
