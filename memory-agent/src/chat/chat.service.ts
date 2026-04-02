import { Injectable, Inject, Logger } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { AgentResponse } from '../agent/agent.service';
import { CHAT_QUEUE, CHAT_QUEUE_EVENTS } from '../queue/queue.module';
import { ChatJobData } from '../queue/chat.processor';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject(CHAT_QUEUE) private readonly queue: Queue,
    @Inject(CHAT_QUEUE_EVENTS) private readonly queueEvents: QueueEvents,
  ) {}

  async sendMessage(
    sessionId: string,
    userMessage: string,
  ): Promise<AgentResponse> {
    const jobData: ChatJobData = { sessionId, userMessage };
    const job = await this.queue.add('chat.message', jobData);

    this.logger.debug(`Job ${job.id} added for session ${sessionId}`);

    const result = await job.waitUntilFinished(this.queueEvents, 30_000);
    return result as AgentResponse;
  }
}
