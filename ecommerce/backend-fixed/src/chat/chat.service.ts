import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartThreadDto } from './dto/start-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // A signed-in customer always gets the SAME thread back (one running
  // conversation per user, like every marketplace's "chat with support"
  // button) instead of spawning a new thread every time they open the widget.
  async startOrGetThread(dto: StartThreadDto) {
    let thread = dto.userId
      ? await this.prisma.chatThread.findFirst({ where: { userId: dto.userId }, orderBy: { createdAt: 'desc' } })
      : null;

    if (!thread) {
      thread = await this.prisma.chatThread.create({
        data: {
          userId: dto.userId,
          userName: dto.userName,
          userRole: dto.userRole || 'customer',
          subject: dto.subject,
          status: 'Open',
        },
      });
    }

    if (dto.message) {
      await this.sendMessage(thread.id, { sender: 'customer', senderName: dto.userName, body: dto.message });
    }

    return this.findOne(thread.id);
  }

  async findAll(params: { status?: string } = {}) {
    return this.prisma.chatThread.findMany({
      where: params.status ? { status: params.status } : undefined,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!thread) throw new NotFoundException(`Chat thread ${id} not found`);
    return thread;
  }

  private async ensureThread(id: string) {
    const thread = await this.prisma.chatThread.findUnique({ where: { id } });
    if (!thread) throw new NotFoundException(`Chat thread ${id} not found`);
    return thread;
  }

  async sendMessage(threadId: string, dto: SendMessageDto) {
    await this.ensureThread(threadId);
    const message = await this.prisma.chatMessage.create({
      data: { threadId, sender: dto.sender, senderName: dto.senderName, body: dto.body },
    });
    await this.prisma.chatThread.update({
      where: { id: threadId },
      data: {
        lastMessage: dto.body,
        status: 'Open',
        ...(dto.sender === 'customer'
          ? { unreadForAdmin: { increment: 1 } }
          : { unreadForCustomer: { increment: 1 } }),
      },
    });
    return message;
  }

  // Call when the admin opens a thread (clears unreadForAdmin) or the
  // customer opens the widget (clears unreadForCustomer).
  async markRead(threadId: string, reader: 'admin' | 'customer') {
    await this.ensureThread(threadId);
    return this.prisma.chatThread.update({
      where: { id: threadId },
      data: reader === 'admin' ? { unreadForAdmin: 0 } : { unreadForCustomer: 0 },
    });
  }

  async setStatus(threadId: string, status: string) {
    await this.ensureThread(threadId);
    return this.prisma.chatThread.update({ where: { id: threadId }, data: { status } });
  }
}
