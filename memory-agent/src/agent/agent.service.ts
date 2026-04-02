import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogle } from '@langchain/google';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { RedisService, ConversationMessage } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { SALES_SYSTEM_PROMPT } from './prompts/sales.prompt';

export interface AgentResponse {
  response: string;
  orderComplete: boolean;
  order?: {
    customerName: string | null;
    items: Array<{
      product: string;
      quantity: number;
      unit: string;
      unitPrice?: number;
      subtotal?: number;
    }>;
    total: number;
    summary: string;
  } | null;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly llm: ChatGoogle;

  constructor(
    private readonly redisService: RedisService,
    private readonly config: ConfigService,
    private readonly storageService: StorageService,
  ) {
    this.llm = new ChatGoogle({
      apiKey: this.config.get<string>('gemini.apiKey') ?? '',
      model: this.config.get<string>('gemini.model') ?? 'gemini-2.5-flash',
    });
  }

  async processMessage(
    sessionId: string,
    userMessage: string,
  ): Promise<AgentResponse> {
    const history = await this.redisService.getConversation(sessionId);
    const messages = this.buildMessages(history, userMessage);

    const rawResponse = await this.llm.invoke(messages);
    const content = rawResponse.content as string;

    let parsed: AgentResponse;
    try {
      parsed = JSON.parse(this.extractJson(content));
    } catch {
      this.logger.warn(`LLM response is not valid JSON for session ${sessionId}: ${content.slice(0, 100)}`);
      parsed = { response: content, orderComplete: false, order: null };
    }

    const newMessages: ConversationMessage[] = [
      { role: 'human', content: userMessage, timestamp: Date.now() },
      { role: 'ai', content: parsed.response, timestamp: Date.now() },
    ];
    await this.redisService.appendMessages(sessionId, newMessages);

    if (parsed.orderComplete && parsed.order) {
      await this.storageService.saveOrder(sessionId, {
        customerName: parsed.order.customerName,
        items: parsed.order.items,
        total: parsed.order.total,
        summary: parsed.order.summary,
      });
      await this.redisService.deleteConversation(sessionId);
    }

    return parsed;
  }

  private extractJson(raw: string): string {
    const trimmed = raw.trim();
    // Gemini a veces envuelve en ```json ... ``` aunque se le pida que no
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) return match[1].trim();
    return trimmed;
  }

  private buildMessages(
    history: ConversationMessage[],
    userMessage: string,
  ): BaseMessage[] {
    const messages: BaseMessage[] = [new SystemMessage(SALES_SYSTEM_PROMPT)];

    for (const msg of history) {
      if (msg.role === 'human') messages.push(new HumanMessage(msg.content));
      else if (msg.role === 'ai') messages.push(new AIMessage(msg.content));
    }

    messages.push(new HumanMessage(userMessage));
    return messages;
  }
}
