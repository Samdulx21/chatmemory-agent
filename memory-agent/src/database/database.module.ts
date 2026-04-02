import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'storage/orders.sqlite',
      entities: [Order],
      synchronize: true, // solo en dev — en prod usar migraciones
    }),
    TypeOrmModule.forFeature([Order]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }
