import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProfile, KYCStatus, User, UserRole } from '../../../database/entities';
import { UserService } from '../../auth/services/user.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepository: Repository<SellerProfile>,
    private readonly userService: UserService,
  ) {}

  async registerSeller(userId: string, shopName: string, address: string, city?: string) {
    // Add seller role to user
    await this.userService.addRole(userId, UserRole.SELLER);

    // Create seller profile
    const sellerProfile = this.sellerProfileRepository.create({
      id: uuid(),
      userId,
      shopName,
      address,
      city,
      kycStatus: KYCStatus.PENDING,
    });

    return this.sellerProfileRepository.save(sellerProfile);
  }

  async getSellerProfile(userId: string) {
    return this.sellerProfileRepository.findOne({
      where: { userId },
      relations: ['products'],
    });
  }

  async updateSellerProfile(userId: string, updates: Partial<SellerProfile>) {
    await this.sellerProfileRepository.update({ userId }, updates);
    return this.getSellerProfile(userId);
  }

  async submitKYC(userId: string, documentUrl: string) {
    const sellerProfile = await this.getSellerProfile(userId);
    if (!sellerProfile) {
      throw new Error('Seller profile not found');
    }

    sellerProfile.kycDocumentUrl = documentUrl;
    sellerProfile.kycStatus = KYCStatus.PENDING;

    return this.sellerProfileRepository.save(sellerProfile);
  }

  async approveKYC(sellerId: string) {
    const sellerProfile = await this.sellerProfileRepository.findOne({
      where: { id: sellerId },
    });

    if (!sellerProfile) {
      throw new Error('Seller not found');
    }

    sellerProfile.kycStatus = KYCStatus.APPROVED;
    return this.sellerProfileRepository.save(sellerProfile);
  }

  async rejectKYC(sellerId: string) {
    const sellerProfile = await this.sellerProfileRepository.findOne({
      where: { id: sellerId },
    });

    if (!sellerProfile) {
      throw new Error('Seller not found');
    }

    sellerProfile.kycStatus = KYCStatus.REJECTED;
    return this.sellerProfileRepository.save(sellerProfile);
  }

  async getAllSellers(kycStatus?: KYCStatus) {
    const query = this.sellerProfileRepository.createQueryBuilder('seller');

    if (kycStatus) {
      query.where('seller.kycStatus = :kycStatus', { kycStatus });
    }

    return query.getMany();
  }

  async updateSellerBalance(userId: string, availableAmount: number, pendingAmount?: number) {
    const sellerProfile = await this.getSellerProfile(userId);
    if (!sellerProfile) {
      throw new Error('Seller profile not found');
    }

    sellerProfile.availableBalance += availableAmount;
    if (pendingAmount !== undefined) {
      sellerProfile.pendingBalance += pendingAmount;
    }

    return this.sellerProfileRepository.save(sellerProfile);
  }

  async getSellerBalance(userId: string) {
    const sellerProfile = await this.getSellerProfile(userId);
    if (!sellerProfile) {
      throw new Error('Seller profile not found');
    }

    return {
      available: sellerProfile.availableBalance,
      pending: sellerProfile.pendingBalance,
      onHold: sellerProfile.onHoldBalance,
      total:
        sellerProfile.availableBalance +
        sellerProfile.pendingBalance +
        sellerProfile.onHoldBalance,
    };
  }
}
