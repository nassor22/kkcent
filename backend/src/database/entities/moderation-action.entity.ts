import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum ModerationActionType {
  SELLER_APPROVED = 'seller_approved',
  SELLER_REJECTED = 'seller_rejected',
  SELLER_SUSPENDED = 'seller_suspended',
  PRODUCT_APPROVED = 'product_approved',
  PRODUCT_REJECTED = 'product_rejected',
  PRODUCT_REMOVED = 'product_removed',
  DISPUTE_RESOLVED = 'dispute_resolved',
  USER_BANNED = 'user_banned',
}

@Entity('moderation_actions')
@Index(['targetType', 'targetId'])
@Index(['adminId'])
export class ModerationAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  adminId: string;

  @Column()
  targetType: string; // 'seller', 'product', 'user', 'order', 'dispute'

  @Column()
  targetId: string;

  @Column({ type: 'enum', enum: ModerationActionType })
  action: ModerationActionType;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
