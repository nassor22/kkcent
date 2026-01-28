import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SellerProfile,
  Product,
  ModerationAction,
  ModerationActionType,
  ProductStatus,
  KYCStatus,
} from '../../../database/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SellerProfile)
    private readonly sellerRepository: Repository<SellerProfile>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ModerationAction)
    private readonly moderationRepository: Repository<ModerationAction>,
  ) {}

  // Seller Management
  async approveSeller(sellerId: string, adminId: string) {
    const seller = await this.sellerRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new Error('Seller not found');
    }

    seller.kycStatus = KYCStatus.APPROVED;
    await this.sellerRepository.save(seller);

    // Log moderation action
    await this.logModerationAction(
      adminId,
      'seller',
      sellerId,
      ModerationActionType.SELLER_APPROVED,
      'Seller KYC approved',
    );

    return seller;
  }

  async rejectSeller(sellerId: string, adminId: string, reason: string) {
    const seller = await this.sellerRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new Error('Seller not found');
    }

    seller.kycStatus = KYCStatus.REJECTED;
    await this.sellerRepository.save(seller);

    await this.logModerationAction(
      adminId,
      'seller',
      sellerId,
      ModerationActionType.SELLER_REJECTED,
      reason,
    );

    return seller;
  }

  async suspendSeller(sellerId: string, adminId: string, reason: string) {
    const seller = await this.sellerRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      throw new Error('Seller not found');
    }

    seller.kycStatus = KYCStatus.SUSPENDED;
    await this.sellerRepository.save(seller);

    await this.logModerationAction(
      adminId,
      'seller',
      sellerId,
      ModerationActionType.SELLER_SUSPENDED,
      reason,
    );

    return seller;
  }

  async getAllSellers() {
    return this.sellerRepository.find({ relations: ['user', 'products'] });
  }

  // Product Management
  async approveProduct(productId: string, adminId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    product.status = ProductStatus.APPROVED;
    await this.productRepository.save(product);

    await this.logModerationAction(
      adminId,
      'product',
      productId,
      ModerationActionType.PRODUCT_APPROVED,
      'Product approved',
    );

    return product;
  }

  async rejectProduct(productId: string, adminId: string, reason: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found');
    }

    product.status = ProductStatus.REJECTED;
    await this.productRepository.save(product);

    await this.logModerationAction(
      adminId,
      'product',
      productId,
      ModerationActionType.PRODUCT_REJECTED,
      reason,
    );

    return product;
  }

  async getPendingProducts() {
    return this.productRepository.find({
      where: { status: ProductStatus.PENDING_APPROVAL },
      relations: ['seller'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAllProducts() {
    return this.productRepository.find({ relations: ['seller'] });
  }

  // Moderation Log
  private async logModerationAction(
    adminId: string,
    targetType: string,
    targetId: string,
    action: ModerationActionType,
    reason?: string,
  ) {
    const modAction = this.moderationRepository.create({
      id: uuid(),
      adminId,
      targetType,
      targetId,
      action,
      reason,
    });

    return this.moderationRepository.save(modAction);
  }

  async getModerationLogs(targetType?: string) {
    const query = this.moderationRepository.createQueryBuilder('action');

    if (targetType) {
      query.where('action.targetType = :targetType', { targetType });
    }

    return query.orderBy('action.createdAt', 'DESC').getMany();
  }
}
