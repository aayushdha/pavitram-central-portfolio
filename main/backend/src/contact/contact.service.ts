import { Injectable, NotFoundException } from "@nestjs/common";
import { MainMessageStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactStatusDto } from "./dto/update-contact-status.dto";

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    const message = await this.prisma.mainContactMessage.create({ data: dto });
    return {
      success: true,
      message: "Message sent! Our support team will get back to you shortly.",
      data: message,
    };
  }

  async list(params: { page?: number; limit?: number; status?: MainMessageStatus; search?: string }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { contact: { contains: params.search, mode: "insensitive" } },
        { subject: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [items, total, unread] = await Promise.all([
      this.prisma.mainContactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mainContactMessage.count({ where }),
      this.prisma.mainContactMessage.count({ where: { status: "NEW" } }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      unread,
    };
  }

  async get(id: string) {
    const item = await this.prisma.mainContactMessage.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Message not found");
    return item;
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto, adminId: string) {
    const item = await this.prisma.mainContactMessage.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Message not found");
    return this.prisma.mainContactMessage.update({
      where: { id },
      data: { status: dto.status, resolvedById: dto.status === "RESOLVED" ? adminId : item.resolvedById },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.mainContactMessage.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Message not found");
    await this.prisma.mainContactMessage.delete({ where: { id } });
    return { message: "Message deleted" };
  }
}
