import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProfile } from '../../database/entities/seller-profile.entity';
import { Product } from '../../database/entities/product.entity';
import { ModerationAction } from '../../database/entities/moderation-action.entity';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([SellerProfile, Product, ModerationAction])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
