import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export interface OrderItem {
  product: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  subtotal?: number;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false })
  sessionId: string;

  @Column('simple-json')
  items: OrderItem[];

  @Column('text')
  summary: string;

  @Column({ nullable: true })
  customerName: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
