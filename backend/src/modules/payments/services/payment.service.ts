import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, Order, OrderStatus } from '../../../database/entities';
import { OrderService } from '../../orders/services/order.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly orderService: OrderService,
  ) {}

  async initiatePayment(orderId: string, provider: string = 'COD') {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new Error('Order not found');
    }

    const payment = this.paymentRepository.create({
      id: uuid(),
      orderId,
      provider,
      amount: order.totalAmount,
      status: PaymentStatus.PENDING,
      reference: this.generatePaymentReference(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // For COD, mark as initiated
    if (provider === 'COD') {
      savedPayment.status = PaymentStatus.INITIATED;
      return this.paymentRepository.save(savedPayment);
    }

    // For other providers, would initiate with provider API
    return savedPayment;
  }

  async completePayment(paymentReference: string, transactionId?: string) {
    const payment = await this.paymentRepository.findOne({
      where: { reference: paymentReference },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = transactionId;

    const savedPayment = await this.paymentRepository.save(payment);

    // Update order status
    const order = await this.orderRepository.findOne({ where: { id: payment.orderId } });
    if (order) {
      order.status = OrderStatus.PAID;
      await this.orderRepository.save(order);
    }

    return savedPayment;
  }

  async failPayment(paymentReference: string, failureReason: string) {
    const payment = await this.paymentRepository.findOne({
      where: { reference: paymentReference },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = failureReason;

    return this.paymentRepository.save(payment);
  }

  async handleWebhook(provider: string, data: any) {
    // TODO: Implement provider-specific webhook handling
    console.log(`Webhook from ${provider}:`, data);

    // Example for generic handling
    const { reference, status } = data;

    if (status === 'success' || status === 'completed') {
      return this.completePayment(reference, data.transactionId);
    } else if (status === 'failed') {
      return this.failPayment(reference, data.reason || 'Payment failed');
    }

    return null;
  }

  async getPaymentByReference(reference: string) {
    return this.paymentRepository.findOne({ where: { reference } });
  }

  async refundPayment(paymentId: string, amount: number) {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Can only refund completed payments');
    }

    // Create refund (in real implementation, call payment provider)
    const refund = this.paymentRepository.create({
      id: uuid(),
      orderId: payment.orderId,
      provider: payment.provider,
      amount: amount,
      status: PaymentStatus.REFUNDED,
      reference: this.generatePaymentReference(),
    });

    const savedRefund = await this.paymentRepository.save(refund);

    // Update order status if full refund
    if (amount === payment.amount) {
      const order = await this.orderRepository.findOne({ where: { id: payment.orderId } });
      if (order) {
        order.status = OrderStatus.REFUNDED;
        await this.orderRepository.save(order);
      }
    }

    return savedRefund;
  }

  private generatePaymentReference(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
