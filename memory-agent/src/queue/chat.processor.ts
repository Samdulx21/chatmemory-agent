import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AgentService, AgentResponse } from '../agent/agent.service';

export interface ChatJobData {
  sessionId: string;
  userMessage: string;
}

@Injectable()
export class ChatProcessor {
  private readonly logger = new Logger(ChatProcessor.name);

  constructor(private readonly agentService: AgentService) {}

  async process(job: Job<ChatJobData>): Promise<AgentResponse> {
    const { sessionId, userMessage } = job.data;
    this.logger.debug(`Processing job ${job.id} for session ${sessionId}`);

    const result = await this.agentService.processMessage(sessionId, userMessage);

    this.logger.debug(
      `Job ${job.id} completed — orderComplete: ${result.orderComplete}`,
    );
    return result;
  }
}
