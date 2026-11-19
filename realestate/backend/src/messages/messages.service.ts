import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Deterministic ordering of the two participant ids keeps the unique constraint meaningful. */
  private orderParticipants(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
  }

  async send(senderId: string, dto: SendMessageDto) {
    if (senderId === dto.toUserId) {
      throw new ForbiddenException('Cannot message yourself');
    }
    const recipient = await this.prisma.realUser.findUnique({ where: { id: dto.toUserId } });
    if (!recipient) throw new NotFoundException('Recipient not found');

    const [participantAId, participantBId] = this.orderParticipants(senderId, dto.toUserId);

    // Find-or-create manually (rather than relying on the compound unique
    // constraint's NULL semantics for propertyId, which vary across
    // databases) so a thread with no property context still dedupes.
    let conversation = await this.prisma.realConversation.findFirst({
      where: { participantAId, participantBId, propertyId: dto.propertyId ?? null },
    });

    if (!conversation) {
      conversation = await this.prisma.realConversation.create({
        data: { participantAId, participantBId, propertyId: dto.propertyId },
      });
    } else {
      conversation = await this.prisma.realConversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });
    }

    const message = await this.prisma.realMessage.create({
      data: { conversationId: conversation.id, senderId, body: dto.body },
    });

    await this.prisma.realNotification.create({
      data: {
        userId: dto.toUserId,
        type: 'MESSAGE',
        title: 'New message',
        body: dto.body.slice(0, 140),
      },
    });

    return { message: 'Message sent', conversationId: conversation.id, chatMessage: message };
  }

  async findMyConversations(userId: string) {
    const conversations = await this.prisma.realConversation.findMany({
      where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
      include: {
        participantA: { select: { id: true, name: true, avatarUrl: true } },
        participantB: { select: { id: true, name: true, avatarUrl: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
    return { conversations };
  }

  async findMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.realConversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.participantAId !== userId && conversation.participantBId !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const messages = await this.prisma.realMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.realMessage.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });

    return { messages };
  }
}
