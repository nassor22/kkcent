import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus, DisputeResolution, Order } from '../../../database/entities';
import { PaymentService } from '../../payments/services/payment.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly paymentService: PaymentService,
  ) {}

  async openDispute(orderId: string, reason: string, description?: string, attachmentUrls?: string[]) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new Error('Order not found');
    }

    const dispute = this.disputeRepository.create({
      id: uuid(),
      orderId,
      reason,
      description,
      attachmentUrls,
      status: DisputeStatus.OPEN,
    });

    return this.disputeRepository.save(dispute);
  }

  async getDispute(disputeId: string) {
    return this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['order', 'assignedAdmin'],
    });
  }

  async getAllDisputes(status?: DisputeStatus) {
    const query = this.disputeRepository.createQueryBuilder('dispute').leftJoinAndSelect('dispute.order', 'order');

    if (status) {
      query.where('dispute.status = :status', { status });
    }

    return query.orderBy('dispute.createdAt', 'DESC').getMany();
  }

  async assignDispute(disputeId: string, adminId: string) {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.assignedAdminId = adminId;
    dispute.status = DisputeStatus.IN_PROGRESS;

    return this.disputeRepository.save(dispute);
  }

  async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    refundAmount?: number,
    notes?: string,
  ) {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.resolution = resolution;
    dispute.refundAmount = refundAmount;
    dispute.resolutionNotes = notes;
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolvedAt = new Date();

    const savedDispute = await this.disputeRepository.save(dispute);

    // Process refund if needed
    if (refundAmount && refundAmount > 0) {
      const payments = dispute.order.payments || [];
      if (payments.length > 0) {
        await this.paymentService.refundPayment(payments[0].id, refundAmount);
      }
    }

    return savedDispute;
  }

  async closeDispute(disputeId: string) {
    const dispute = await this.getDispute(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = DisputeStatus.CLOSED;
    return this.disputeRepository.save(dispute);
  }
}
