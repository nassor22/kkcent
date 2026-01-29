import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../database/entities/product.entity';
import { ProductVariant } from '../../database/entities/product-variant.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { ProductImage } from '../../database/entities/product-image.entity';
import { CatalogController } from './controllers/catalog.controller';
import { CatalogService } from './services/catalog.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, Inventory, ProductImage])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
