import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() dto: ChatMessageDto) {
    const result = await this.chatService.sendMessage(dto.sessionId, dto.message);
    return {
      sessionId: dto.sessionId,
      response: result.response,
      orderComplete: result.orderComplete,
      order: result.order ?? null,
    };
  }
}
