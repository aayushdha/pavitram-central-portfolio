import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(CentralAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  findMyConversations(@CurrentUser() user: RequestUser) {
    return this.messagesService.findMyConversations(user.id);
  }

  @Get('conversations/:conversationId')
  findMessages(@CurrentUser() user: RequestUser, @Param('conversationId') conversationId: string) {
    return this.messagesService.findMessages(conversationId, user.id);
  }

  @Post()
  send(@CurrentUser() user: RequestUser, @Body() dto: SendMessageDto) {
    return this.messagesService.send(user.id, dto);
  }
}
