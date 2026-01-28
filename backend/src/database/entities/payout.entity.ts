import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SellerProfile } from './seller-profile.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  INITIATED = 'initiated',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payouts')
@Index(['sellerId'])
@Index(['status'])
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sellerId: string;

  @ManyToOne(() => SellerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sellerId' })
  seller: SellerProfile;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
  status: PayoutStatus;

  @Column({ nullable: true })
  transactionReference: string;

  @CreateDateColumn()
  initiatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;
}
