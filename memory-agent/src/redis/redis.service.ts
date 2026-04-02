import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export interface ConversationMessage {
  role: 'human' | 'ai' | 'system';
  content: string;
  timestamp: number;
}

@Injectable()
export class RedisService {
  private readonly ttl: number;
  private readonly keyPrefix: string;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    this.ttl = this.config.get<number>('cacheTtl') ?? 1800;
    this.keyPrefix = this.config.get<string>('redis.keyPrefix') ?? '';
  }

  private conversationKey(sessionId: string): string {
    return `${this.keyPrefix}conversation:${sessionId}`;
  }

  async getConversation(sessionId: string): Promise<ConversationMessage[]> {
    const data = await this.redis.get(this.conversationKey(sessionId));
    if (!data) return [];
    return JSON.parse(data) as ConversationMessage[];
  }

  async saveConversation(
    sessionId: string,
    messages: ConversationMessage[],
  ): Promise<void> {
    const key = this.conversationKey(sessionId);
    await this.redis.set(key, JSON.stringify(messages), 'EX', this.ttl);
  }

  async appendMessages(
    sessionId: string,
    newMessages: ConversationMessage[],
  ): Promise<ConversationMessage[]> {
    const existing = await this.getConversation(sessionId);
    const updated = [...existing, ...newMessages];
    await this.saveConversation(sessionId, updated);
    return updated;
  }

  async deleteConversation(sessionId: string): Promise<void> {
    await this.redis.del(this.conversationKey(sessionId));
  }

  async refreshTtl(sessionId: string): Promise<void> {
    await this.redis.expire(this.conversationKey(sessionId), this.ttl);
  }
}
