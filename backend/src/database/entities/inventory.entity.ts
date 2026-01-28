import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('inventory')
@Index(['variantId'], { unique: true })
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  variantId: string;

  @OneToOne(() => ProductVariant, (variant) => variant.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;

  @Column({ default: 0 })
  quantityAvailable: number;

  @Column({ default: 0 })
  reservedQuantity: number;

  @Column({ default: 0 })
  soldQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
