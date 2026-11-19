import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { MainRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ProfileFormDto } from "./dto/profile-form.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { AdminCreateUserDto } from "./dto/admin-create-user.dto";
import { toAuthUser } from "../auth/auth.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Public "Join the Community" form submission -> creates a main_community_members row. */
  async submitProfileForm(dto: ProfileFormDto) {
    const member = await this.prisma.mainCommunityMember.create({
      data: {
        fullName: dto.fullName,
        mobileNumber: dto.mobileNumber,
        profession: dto.profession,
        designation: dto.designation,
        organization: dto.organization,
        location: dto.location,
        city: dto.city,
        state: dto.state,
        reference: dto.reference,
      },
    });

    return {
      success: true,
      message: "Thank you! Your community membership application has been received.",
      data: member,
    };
  }

  // ---- Admin: user management --------------------------------------------

  async adminList(params: { page?: number; limit?: number; search?: string; role?: MainRole }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.mainUser.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.mainUser.count({ where }),
    ]);

    return {
      data: items.map(toAuthUser),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async adminGet(id: string) {
    const user = await this.prisma.mainUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return toAuthUser(user);
  }

  async adminCreate(dto: AdminCreateUserDto) {
    const existing = await this.prisma.mainUser.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }] },
    });
    if (existing) throw new ConflictException("A user with this email or phone already exists");

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.mainUser.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        password: hashed,
        role: dto.role ?? "USER",
        isOnboarded: true,
      },
    });
    return toAuthUser(user);
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto, actorRole: MainRole) {
    const target = await this.prisma.mainUser.findUnique({ where: { id } });
    if (!target) throw new NotFoundException("User not found");

    if (
      (dto.role === "ADMIN" || dto.role === "SUPER_ADMIN" || target.role === "SUPER_ADMIN") &&
      actorRole !== "SUPER_ADMIN"
    ) {
      throw new ForbiddenException("Only a Super Admin can manage admin-level accounts");
    }

    const user = await this.prisma.mainUser.update({ where: { id }, data: dto });
    return toAuthUser(user);
  }

  async adminDelete(id: string, actorRole: MainRole) {
    const target = await this.prisma.mainUser.findUnique({ where: { id } });
    if (!target) throw new NotFoundException("User not found");
    if (target.role === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") {
      throw new ForbiddenException("Only a Super Admin can delete an admin-level account");
    }
    await this.prisma.mainUser.delete({ where: { id } });
    return { message: "User deleted successfully" };
  }
}
