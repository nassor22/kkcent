import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum PayoutMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
}

@Entity('seller_profiles')
@Index(['userId'], { unique: true })
export class SellerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.sellerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  shopName: string;

  @Column({ type: 'text', nullable: true })
  shopDescription: string;

  @Column({ nullable: true })
  shopImageUrl: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ type: 'enum', enum: KYCStatus, default: KYCStatus.PENDING })
  kycStatus: KYCStatus;

  @Column({ nullable: true })
  kycDocumentUrl: string;

  @Column({ type: 'enum', enum: PayoutMethod, default: PayoutMethod.MOBILE_MONEY })
  payoutMethod: PayoutMethod;

  @Column({ nullable: true })
  payoutDestination: string; // phone for mobile money, account for bank

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pendingBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  onHoldBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];
}
