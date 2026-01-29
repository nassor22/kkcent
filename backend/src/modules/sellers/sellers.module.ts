import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProfile } from '../../database/entities/seller-profile.entity';
import { AuthModule } from '../auth/auth.module';
import { SellerController } from './controllers/seller.controller';
import { SellerService } from './services/seller.service';

@Module({
  imports: [TypeOrmModule.forFeature([SellerProfile]), AuthModule],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellersModule {}
