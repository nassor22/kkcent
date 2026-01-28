import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispute, Order } from '../../../database/entities';
import { PaymentsModule } from '../../payments/payments.module';
import { DisputeController } from './controllers/dispute.controller';
import { DisputeService } from './services/dispute.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dispute, Order]), PaymentsModule],
  controllers: [DisputeController],
  providers: [DisputeService],
  exports: [DisputeService],
})
export class DisputesModule {}
