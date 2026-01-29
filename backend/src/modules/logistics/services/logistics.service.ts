import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from '../../../database/entities/shipment.entity';
import { Order } from '../../../database/entities/order.entity';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Create a new shipment for an order
   */
  async createShipment(
    orderId: string,
    courierName: string,
    trackingCode: string,
    estimatedDeliveryDate?: Date,
  ): Promise<Shipment> {
    // Check if order exists
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if shipment already exists
    const existingShipment = await this.shipmentRepository.findOne({
      where: { orderId },
    });
    if (existingShipment) {
      throw new BadRequestException('Shipment already exists for this order');
    }

    const shipment = this.shipmentRepository.create({
      orderId,
      courierName,
      trackingCode,
      status: ShipmentStatus.PENDING,
      estimatedDeliveryDate,
    });

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus,
    currentLocation?: string,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.status = status;
    if (currentLocation) {
      shipment.currentLocation = currentLocation;
    }

    if (status === ShipmentStatus.DELIVERED) {
      shipment.deliveredAt = new Date();
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Update tracking information
   */
  async updateTracking(
    shipmentId: string,
    currentLocation: string,
    notes?: string,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.currentLocation = currentLocation;
    if (notes) {
      shipment.trackingNotes = notes;
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Get shipment by tracking code
   */
  async getShipmentByTrackingCode(trackingCode: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingCode },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  /**
   * Get shipment by order ID
   */
  async getShipmentByOrderId(orderId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { orderId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found for this order');
    }

    return shipment;
  }

  /**
   * Get all shipments for a courier
   */
  async getShipmentsByCourier(
    courierName: string,
    status?: ShipmentStatus,
  ): Promise<Shipment[]> {
    const query: any = { courierName };
    if (status) {
      query.status = status;
    }

    return await this.shipmentRepository.find({
      where: query,
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get shipment history
   */
  async getShipmentHistory(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order', 'order.buyer'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  /**
   * Calculate estimated delivery date based on location
   */
  calculateEstimatedDelivery(destination: string): Date {
    // Simple implementation - add 3-7 days based on location
    const daysToAdd = destination.toLowerCase().includes('express') ? 3 : 7;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    return estimatedDate;
  }

  /**
   * Assign courier to shipment
   */
  async assignCourier(
    shipmentId: string,
    courierName: string,
    trackingCode: string,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException(
        'Cannot reassign courier for shipment that is not pending',
      );
    }

    shipment.courierName = courierName;
    shipment.trackingCode = trackingCode;
    shipment.status = ShipmentStatus.PICKED_UP;

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Mark shipment as out for delivery
   */
  async markOutForDelivery(shipmentId: string, courierPhone?: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.status = ShipmentStatus.OUT_FOR_DELIVERY;
    if (courierPhone) {
      shipment.trackingNotes = `Courier contact: ${courierPhone}`;
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Mark shipment as delivered
   */
  async markDelivered(
    shipmentId: string,
    deliveryProof?: string,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.status = ShipmentStatus.DELIVERED;
    shipment.deliveredAt = new Date();
    if (deliveryProof) {
      shipment.trackingNotes = `${shipment.trackingNotes || ''}\nDelivery proof: ${deliveryProof}`;
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Handle failed delivery
   */
  async markDeliveryFailed(
    shipmentId: string,
    reason: string,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    shipment.status = ShipmentStatus.FAILED;
    shipment.trackingNotes = `${shipment.trackingNotes || ''}\nFailed: ${reason}`;

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Get active shipments count by status
   */
  async getShipmentStats(): Promise<{
    pending: number;
    pickedUp: number;
    inTransit: number;
    outForDelivery: number;
    delivered: number;
    failed: number;
  }> {
    const [pending, pickedUp, inTransit, outForDelivery, delivered, failed] =
      await Promise.all([
        this.shipmentRepository.count({ where: { status: ShipmentStatus.PENDING } }),
        this.shipmentRepository.count({ where: { status: ShipmentStatus.PICKED_UP } }),
        this.shipmentRepository.count({ where: { status: ShipmentStatus.IN_TRANSIT } }),
        this.shipmentRepository.count({
          where: { status: ShipmentStatus.OUT_FOR_DELIVERY },
        }),
        this.shipmentRepository.count({ where: { status: ShipmentStatus.DELIVERED } }),
        this.shipmentRepository.count({ where: { status: ShipmentStatus.FAILED } }),
      ]);

    return {
      pending,
      pickedUp,
      inTransit,
      outForDelivery,
      delivered,
      failed,
    };
  }
}
