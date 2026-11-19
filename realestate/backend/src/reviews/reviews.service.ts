import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewTargetType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, dto: CreateReviewDto) {
    if (dto.targetType === ReviewTargetType.PROPERTY && !dto.propertyId) {
      throw new BadRequestException('propertyId is required for a PROPERTY review');
    }
    if (dto.targetType === ReviewTargetType.PROJECT && !dto.projectId) {
      throw new BadRequestException('projectId is required for a PROJECT review');
    }
    if (dto.targetType === ReviewTargetType.SERVICE_PROVIDER && !dto.providerId) {
      throw new BadRequestException('providerId is required for a SERVICE_PROVIDER review');
    }

    const review = await this.prisma.realReview.create({
      data: {
        authorId,
        targetType: dto.targetType,
        propertyId: dto.propertyId,
        projectId: dto.projectId,
        providerId: dto.providerId,
        rating: dto.rating,
        text: dto.text,
      },
    });

    if (dto.targetType === ReviewTargetType.SERVICE_PROVIDER && dto.providerId) {
      await this.recalculateProviderRating(dto.providerId);
    }

    return { message: 'Review submitted', review };
  }

  async findForTarget(targetType: ReviewTargetType, targetId: string) {
    const where =
      targetType === ReviewTargetType.PROPERTY
        ? { propertyId: targetId }
        : targetType === ReviewTargetType.PROJECT
          ? { projectId: targetId }
          : { providerId: targetId };

    const reviews = await this.prisma.realReview.findMany({
      where,
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { reviews };
  }

  private async recalculateProviderRating(providerId: string) {
    const provider = await this.prisma.realServiceProvider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Service provider not found');

    const agg = await this.prisma.realReview.aggregate({
      where: { providerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.realServiceProvider.update({
      where: { id: providerId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });
  }
}
