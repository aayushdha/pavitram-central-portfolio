import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    const notifications = await this.prisma.realNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const unreadCount = await this.prisma.realNotification.count({ where: { userId, read: false } });
    return { notifications, unreadCount };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.realNotification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Not your notification');

    const updated = await this.prisma.realNotification.update({ where: { id }, data: { read: true } });
    return { notification: updated };
  }

  async markAllRead(userId: string) {
    await this.prisma.realNotification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { message: 'All notifications marked as read' };
  }
}
