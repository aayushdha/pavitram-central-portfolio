import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RealRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/guards/central-auth.guard';
import { QueryProviderDto } from './dto/query-provider.dto';
import { UpsertProviderProfileDto } from './dto/upsert-provider-profile.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMyProfile(user: RequestUser, dto: UpsertProviderProfileDto) {
    const profile = await this.prisma.realServiceProvider.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...dto },
      update: dto,
    });

    if (!user.roles.includes(RealRole.PROVIDER)) {
      await this.prisma.realUser.update({
        where: { id: user.id },
        data: { roles: Array.from(new Set([...user.roles, RealRole.PROVIDER])) },
      });
    }

    return { message: 'Provider profile saved', profile };
  }

  async findAll(query: QueryProviderDto) {
    const providers = await this.prisma.realServiceProvider.findMany({
      where: { category: query.category, city: query.city ? { equals: query.city, mode: 'insensitive' } : undefined },
      orderBy: { ratingAvg: 'desc' },
    });
    return { providers };
  }

  async findOne(id: string) {
    const provider = await this.prisma.realServiceProvider.findUnique({
      where: { id },
      include: { reviews: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!provider) throw new NotFoundException('Service provider not found');
    return { provider };
  }

  async findMine(userId: string) {
    // Deliberately returns { profile: null } rather than throwing 404 —
    // "hasn't set up a provider profile yet" is a normal state for the
    // provider dashboard to be in (e.g. right after adding the PROVIDER
    // role), not an error condition. Throwing here made the frontend's own
    // overview/bookings/earnings pages show a scary red error banner
    // instead of the friendly "set up your profile" prompt they're built to
    // show for this exact case — confirmed via test-frontend-e2e-extended.mjs.
    const profile = await this.prisma.realServiceProvider.findUnique({ where: { userId } });
    return { profile };
  }
}