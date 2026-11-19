import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { MainUser } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

/** Public-safe user shape returned to the frontend (never includes the password hash). */
export function toAuthUser(user: MainUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    accountStatus: user.accountStatus,
    kycStatus: user.kycStatus,
    isOnboarded: user.isOnboarded,
    address: user.address,
    city: user.city,
    state: user.state,
    profession: user.profession,
    designation: user.designation,
    organization: user.organization,
    reference: user.reference,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.mainUser.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === dto.email.toLowerCase()
          ? "An account with this email already exists"
          : "An account with this phone number already exists",
      );
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.mainUser.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        password: hashed,
        role: "USER",
      },
    });

    return { message: "Account created successfully", user: toAuthUser(user) };
  }

  async signin(dto: SigninDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.prisma.mainUser.findFirst({
      where: { OR: [{ email: identifier }, { phone: dto.identifier.trim() }] },
    });
    if (!user) throw new UnauthorizedException("Invalid email/phone or password");

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid email/phone or password");

    if (user.accountStatus === "SUSPENDED") {
      throw new UnauthorizedException("Your account has been suspended. Contact support.");
    }

    await this.prisma.mainUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const access_token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });

    return { message: "Login successful", access_token, user: toAuthUser(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.mainUser.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("Account no longer exists");
    return {
      message: "Token is valid",
      user: { userId: user.id, email: user.email, role: user.role },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const current = await this.prisma.mainUser.findUnique({ where: { id: userId } });
    if (!current) throw new UnauthorizedException("Account no longer exists");

    const nextName = dto.name ?? current.name;
    const nextPhone = dto.phone ?? current.phone;
    const nextAddress = dto.address ?? current.address;

    const isOnboarded = Boolean(nextName && nextPhone && nextAddress) || current.isOnboarded;

    const user = await this.prisma.mainUser.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        profession: dto.profession,
        designation: dto.designation,
        organization: dto.organization,
        reference: dto.reference,
        isOnboarded,
      },
    });

    return { message: "Profile updated successfully", user: toAuthUser(user) };
  }
}
