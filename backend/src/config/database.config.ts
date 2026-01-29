import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { SellerProfile } from '../database/entities/seller-profile.entity';
import { Product } from '../database/entities/product.entity';
import { ProductVariant } from '../database/entities/product-variant.entity';
import { Inventory } from '../database/entities/inventory.entity';
import { ProductImage } from '../database/entities/product-image.entity';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Payment } from '../database/entities/payment.entity';
import { Review } from '../database/entities/review.entity';
import { Payout } from '../database/entities/payout.entity';
import { Dispute } from '../database/entities/dispute.entity';
import { ModerationAction } from '../database/entities/moderation-action.entity';
import { Shipment } from '../database/entities/shipment.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'marketplace',
  entities: [
    User,
    SellerProfile,
    Product,
    ProductVariant,
    Inventory,
    ProductImage,
    Order,
    OrderItem,
    Payment,
    Review,
    Payout,
    Dispute,
    ModerationAction,
    Shipment,
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: false,
});
