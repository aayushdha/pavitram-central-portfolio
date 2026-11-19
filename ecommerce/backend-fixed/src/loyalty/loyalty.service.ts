import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EarnPointsDto } from './dto/earn-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

function tierFor(lifetimePoints: number) {
  if (lifetimePoints >= 20000) return 'Platinum';
  if (lifetimePoints >= 5000) return 'Gold';
  return 'Silver';
}

function generateReferralCode(userId: string) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PVT-${userId.slice(-4).toUpperCase()}${suffix}`;
}

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  // Every user gets a loyalty account lazily, the first time it's touched.
  async getOrCreateAccount(userId: string) {
    let account = await this.prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account) {
      account = await this.prisma.loyaltyAccount.create({
        data: { userId, referralCode: generateReferralCode(userId) },
      });
    }
    return account;
  }

  async getAccount(userId: string) {
    const account = await this.getOrCreateAccount(userId);
    const transactions = await this.prisma.loyaltyTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const referrals = await this.prisma.referral.findMany({
      where: { referrerAccountId: account.id },
      orderBy: { createdAt: 'desc' },
    });
    return { ...account, transactions, referrals };
  }

  async earn(dto: EarnPointsDto) {
    const account = await this.getOrCreateAccount(dto.userId);
    const updated = await this.prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        points: { increment: dto.points },
        lifetimePoints: { increment: dto.points },
        tier: tierFor(account.lifetimePoints + dto.points),
      },
    });
    const tx = await this.prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'earn',
        points: dto.points,
        orderId: dto.orderId,
        note: dto.note || 'Points earned on purchase',
      },
    });
    return { account: updated, transaction: tx };
  }

  async redeem(dto: RedeemPointsDto) {
    const account = await this.getOrCreateAccount(dto.userId);
    // BUGFIX: check-then-update wasn't atomic — two redeem requests fired
    // close together could both pass the balance check before either had
    // decremented, letting a user redeem more points than they had. Same
    // fix pattern as the stock-oversell bug: a single conditional update
    // (only succeeds if points >= requested) makes this race-proof.
    const updated = await this.prisma.loyaltyAccount.updateMany({
      where: { id: account.id, points: { gte: dto.points } },
      data: { points: { decrement: dto.points } },
    });
    if (updated.count === 0) {
      const fresh = await this.prisma.loyaltyAccount.findUnique({ where: { id: account.id } });
      throw new BadRequestException(`Insufficient points: balance ${fresh?.points ?? 0}, requested ${dto.points}`);
    }
    const updatedAccount = await this.prisma.loyaltyAccount.findUnique({ where: { id: account.id } });
    const tx = await this.prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'redeem',
        points: -dto.points,
        orderId: dto.orderId,
        note: dto.note || 'Points redeemed',
      },
    });
    return { account: updatedAccount, transaction: tx };
  }

  // ---------------- Referrals ----------------
  async createReferral(dto: CreateReferralDto) {
    const account = await this.getOrCreateAccount(dto.referrerUserId);
    return this.prisma.referral.create({
      data: {
        referrerAccountId: account.id,
        referredEmail: dto.referredEmail,
        referredUserId: dto.referredUserId,
      },
    });
  }

  async listReferrals(params: { userId?: string } = {}) {
    if (!params.userId) {
      return this.prisma.referral.findMany({ orderBy: { createdAt: 'desc' } });
    }
    const account = await this.prisma.loyaltyAccount.findUnique({ where: { userId: params.userId } });
    if (!account) return [];
    return this.prisma.referral.findMany({ where: { referrerAccountId: account.id }, orderBy: { createdAt: 'desc' } });
  }

  // Admin/system marks a referral Completed (referred friend signed up) or
  // Rewarded (bonus points credited to the referrer).
  async updateReferral(id: string, dto: UpdateReferralDto) {
    const referral = await this.prisma.referral.findUnique({ where: { id } });
    if (!referral) throw new NotFoundException(`Referral ${id} not found`);

    const updated = await this.prisma.referral.update({ where: { id }, data: dto });

    if (dto.status === 'Rewarded' && referral.status !== 'Rewarded') {
      const bonus = dto.bonusPoints ?? referral.bonusPoints ?? 250;
      const account = await this.prisma.loyaltyAccount.findUnique({ where: { id: referral.referrerAccountId } });
      if (account) {
        await this.prisma.loyaltyAccount.update({
          where: { id: account.id },
          data: {
            points: { increment: bonus },
            lifetimePoints: { increment: bonus },
            tier: tierFor(account.lifetimePoints + bonus),
          },
        });
        await this.prisma.loyaltyTransaction.create({
          data: {
            accountId: account.id,
            type: 'referral_bonus',
            points: bonus,
            note: `Referral bonus for ${referral.referredEmail}`,
          },
        });
      }
    }

    return updated;
  }
}
