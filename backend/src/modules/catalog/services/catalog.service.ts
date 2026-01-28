import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus, ProductVariant, Inventory } from '../../../database/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async searchProducts(
    query?: string,
    category?: string,
    priceMin?: number,
    priceMax?: number,
    skip: number = 0,
    take: number = 20,
  ) {
    let q = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('variant.inventory', 'inventory')
      .where('product.status = :status', { status: ProductStatus.APPROVED });

    if (query) {
      q = q.andWhere(
        '(product.title ILIKE :query OR product.description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (category) {
      q = q.andWhere('product.categoryId = :category', { category });
    }

    // Price filtering
    if (priceMin !== undefined || priceMax !== undefined) {
      q = q.andWhere('variant.price >= :priceMin', {
        priceMin: priceMin || 0,
      });
      if (priceMax !== undefined) {
        q = q.andWhere('variant.price <= :priceMax', { priceMax });
      }
    }

    const [products, total] = await q
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { products, total, page: skip / take, pageSize: take };
  }

  async getProductById(id: string) {
    return this.productRepository.findOne({
      where: { id },
      relations: ['variants', 'variants.inventory', 'images', 'reviews', 'seller'],
    });
  }

  async createProduct(
    sellerId: string,
    categoryId: string,
    title: string,
    description: string,
    basePrice: number,
  ) {
    const product = this.productRepository.create({
      id: uuid(),
      sellerId,
      categoryId,
      title,
      description,
      basePrice,
      status: ProductStatus.PENDING_APPROVAL,
    });

    return this.productRepository.save(product);
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    await this.productRepository.update(id, updates);
    return this.getProductById(id);
  }

  async createVariant(
    productId: string,
    sku: string,
    attributes: Record<string, string>,
    price: number,
    weight?: number,
    barcode?: string,
  ) {
    const variant = this.variantRepository.create({
      id: uuid(),
      productId,
      sku,
      attributes,
      price,
      weight,
      barcode,
    });

    const savedVariant = await this.variantRepository.save(variant);

    // Create inventory
    const inventory = this.inventoryRepository.create({
      id: uuid(),
      variantId: savedVariant.id,
      quantityAvailable: 0,
      reservedQuantity: 0,
      soldQuantity: 0,
    });

    await this.inventoryRepository.save(inventory);

    return savedVariant;
  }

  async updateInventory(variantId: string, quantityAvailable: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    inventory.quantityAvailable = quantityAvailable;
    return this.inventoryRepository.save(inventory);
  }

  async reserveStock(variantId: string, quantity: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const available = inventory.quantityAvailable - inventory.reservedQuantity;

    if (available < quantity) {
      throw new Error('Insufficient stock');
    }

    inventory.reservedQuantity += quantity;
    return this.inventoryRepository.save(inventory);
  }

  async releaseReservedStock(variantId: string, quantity: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
    return this.inventoryRepository.save(inventory);
  }

  async confirmStock(variantId: string, quantity: number) {
    const inventory = await this.inventoryRepository.findOne({
      where: { variantId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);
    inventory.soldQuantity += quantity;
    inventory.quantityAvailable = Math.max(0, inventory.quantityAvailable - quantity);

    return this.inventoryRepository.save(inventory);
  }
}
