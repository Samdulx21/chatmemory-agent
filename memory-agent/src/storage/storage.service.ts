import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface OrderItem {
  product: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  subtotal?: number;
}

export interface SavedOrder {
  id: string;
  sessionId: string;
  customerName: string | null;
  items: OrderItem[];
  total: number;
  summary: string;
  createdAt: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly filePath = join(process.cwd(), 'storage', 'orders.json');

  async saveOrder(
    sessionId: string,
    data: Omit<SavedOrder, 'id' | 'sessionId' | 'createdAt'>,
  ): Promise<SavedOrder> {
    const orders = await this.readAll();

    const order: SavedOrder = {
      id: crypto.randomUUID(),
      sessionId,
      createdAt: new Date().toISOString(),
      ...data,
    };

    orders.push(order);
    await this.write(orders);
    this.logger.log(`Order ${order.id} saved for session ${sessionId}`);
    return order;
  }

  async getAll(): Promise<SavedOrder[]> {
    return this.readAll();
  }

  private async readAll(): Promise<SavedOrder[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as SavedOrder[];
    } catch {
      return [];
    }
  }

  private async write(orders: SavedOrder[]): Promise<void> {
    await fs.mkdir(join(process.cwd(), 'storage'), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(orders, null, 2), 'utf-8');
  }
}
