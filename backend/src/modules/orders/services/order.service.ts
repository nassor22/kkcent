import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, OrderItem, OrderItemStatus } from '../../../database/entities';
import { CatalogService } from '../../catalog/services/catalog.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly catalogService: CatalogService,
  ) {}

  async createOrder(buyerId: string, items: any[], deliveryAddressId?: string) {
    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const variant = await this.catalogService.getProductById(item.productId); // Simplified
      if (!variant) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Reserve stock
      await this.catalogService.reserveStock(item.variantId, item.quantity);

      const itemPrice = (variant as any).basePrice || 0;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: itemPrice,
      });
    }

    // Create order
    const order = this.orderRepository.create({
      id: uuid(),
      buyerId,
      totalAmount,
      status: OrderStatus.PENDING_PAYMENT,
      deliveryAddressId,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        id: uuid(),
        orderId: savedOrder.id,
        sellerId: '', // TODO: Get from variant/product
        ...item,
      });
      await this.orderItemRepository.save(orderItem);
    }

    return savedOrder;
  }

  async getOrderById(orderId: string) {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'payments'],
    });
  }

  async getOrdersByBuyer(buyerId: string, skip = 0, take = 20) {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { buyerId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { orders, total, page: skip / take, pageSize: take };
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate state transition
    this.validateStatusTransition(order.status, newStatus);

    order.status = newStatus;
    return this.orderRepository.save(order);
  }

  async updateOrderItemStatus(orderItemId: string, newStatus: OrderItemStatus) {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId },
    });

    if (!orderItem) {
      throw new Error('Order item not found');
    }

    orderItem.status = newStatus;
    return this.orderItemRepository.save(orderItem);
  }

  async cancelOrder(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (![OrderStatus.PENDING_PAYMENT, OrderStatus.PLACED, OrderStatus.PAID].includes(order.status)) {
      throw new Error('Cannot cancel order in current state');
    }

    // Release stock reservations
    for (const item of order.items) {
      await this.catalogService.releaseReservedStock(item.variantId, item.quantity);
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.DRAFT]: [OrderStatus.PENDING_PAYMENT],
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PLACED, OrderStatus.CANCELLED],
      [OrderStatus.PLACED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.REFUNDED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
      [OrderStatus.PACKED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURN_REQUESTED, OrderStatus.DISPUTED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURNED, OrderStatus.DISPUTED],
      [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.DISPUTED]: [OrderStatus.REFUNDED],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
