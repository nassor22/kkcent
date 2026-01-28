import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductVariant, Inventory, ProductImage } from '../../../database/entities';
import { CatalogController } from './controllers/catalog.controller';
import { CatalogService } from './services/catalog.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, Inventory, ProductImage])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
