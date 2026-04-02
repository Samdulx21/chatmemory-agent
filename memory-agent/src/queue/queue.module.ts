import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, QueueEvents } from 'bullmq';
import { ChatProcessor } from './chat.processor';
import { AgentModule } from '../agent/agent.module';

export const CHAT_QUEUE = 'CHAT_QUEUE';
export const CHAT_QUEUE_EVENTS = 'CHAT_QUEUE_EVENTS';
export const CHAT_WORKER = 'CHAT_WORKER';

function bullmqConnection(config: ConfigService) {
  // BullMQ requiere maxRetriesPerRequest: null — NO puede usar el cliente principal
  return {
    url: config.get<string>('redis.url'),
    db: config.get<number>('redis.db') ?? 0,
    maxRetriesPerRequest: null,  // obligatorio para BullMQ
    enableOfflineQueue: false,
  };
}

@Module({
  imports: [AgentModule],
  providers: [
    ChatProcessor,
    {
      provide: CHAT_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Queue('chat', {
          connection: bullmqConnection(config),
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: 100,
            removeOnFail: 50,
          },
        });
      },
    },
    {
      provide: CHAT_QUEUE_EVENTS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new QueueEvents('chat', { connection: bullmqConnection(config) });
      },
    },
    {
      provide: CHAT_WORKER,
      inject: [ConfigService, ChatProcessor],
      useFactory: (config: ConfigService, processor: ChatProcessor) => {
        return new Worker(
          'chat',
          (job) => processor.process(job),
          {
            connection: bullmqConnection(config),
            concurrency: 5,
          },
        );
      },
    },
  ],
  exports: [CHAT_QUEUE, CHAT_QUEUE_EVENTS],
})
export class QueueModule {}
