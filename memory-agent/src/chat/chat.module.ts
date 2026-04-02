import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [QueueModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
