import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { StartThreadDto } from './dto/start-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('chat')
@Controller('chat/threads')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Open (or resume) the support chat for a user. Optionally send the first message in the same call.' })
  start(@Body() dto: StartThreadDto) {
    return this.service.startOrGetThread(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Admin inbox — list every chat thread, newest activity first' })
  findAll(@Query('status') status?: string) {
    return this.service.findAll({ status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one thread with its full message history' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a thread — sender is "customer" or "admin"' })
  sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.service.sendMessage(id, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a thread as read for "admin" or "customer" (clears their unread badge count)' })
  markRead(@Param('id') id: string, @Query('as') as: 'admin' | 'customer' = 'admin') {
    return this.service.markRead(id, as);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update thread status, e.g. { "status": "Resolved" }' })
  setStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.setStatus(id, status);
  }
}
