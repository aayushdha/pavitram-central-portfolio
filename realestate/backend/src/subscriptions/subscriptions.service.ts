import { Injectable } from '@nestjs/common';
import { SubscriptionPlanCode, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

/** Simple static plan catalog. Swap for a real billing integration later. */
const PLAN_CREDITS: Record<SubscriptionPlanCode, { credits: number; days: number }> = {
  FREE: { credits: 3, days: 30 },
  BASIC: { credits: 25, days: 30 },
  PRO: { credits: 100, days: 30 },
  ENTERPRISE: { credits: 1000, days: 365 },
};

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(userId: string, dto: SubscribeDto) {
    // Cancel any currently active plan before starting the new one.
    await this.prisma.realSubscription.updateMany({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    const plan = PLAN_CREDITS[dto.planCode];
    const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.realSubscription.create({
      data: {
        userId,
        planCode: dto.planCode,
        status: SubscriptionStatus.ACTIVE,
        creditsTotal: plan.credits,
        creditsRemaining: plan.credits,
        expiresAt,
      },
    });

    return { message: 'Subscription activated', subscription };
  }

  async findMine(userId: string) {
    const subscriptions = await this.prisma.realSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { subscriptions };
  }

  /** Deducts one credit from the user's active plan; used e.g. when unlocking a lead's phone number. */
  async consumeCredit(userId: string) {
    const active = await this.prisma.realSubscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE, creditsRemaining: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
    });
    if (!active) return { ok: false, message: 'No credits remaining' };

    await this.prisma.realSubscription.update({
      where: { id: active.id },
      data: { creditsRemaining: { decrement: 1 } },
    });
    return { ok: true };
  }
}
