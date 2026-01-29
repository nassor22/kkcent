import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LogisticsService } from '../services/logistics.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ShipmentStatus } from '../../../database/entities/shipment.entity';

@Controller('logistics')
@UseGuards(JwtGuard, RolesGuard)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  /**
   * Create a new shipment
   * POST /logistics/shipments
   */
  @Post('shipments')
  @Roles('seller', 'admin')
  async createShipment(
    @Body()
    body: {
      orderId: string;
      courierName: string;
      trackingCode: string;
      estimatedDeliveryDate?: Date;
    },
  ) {
    return await this.logisticsService.createShipment(
      body.orderId,
      body.courierName,
      body.trackingCode,
      body.estimatedDeliveryDate,
    );
  }

  /**
   * Get shipment by tracking code (public or authenticated)
   * GET /logistics/track/:trackingCode
   */
  @Get('track/:trackingCode')
  async trackShipment(@Param('trackingCode') trackingCode: string) {
    return await this.logisticsService.getShipmentByTrackingCode(trackingCode);
  }

  /**
   * Get shipment by order ID
   * GET /logistics/orders/:orderId/shipment
   */
  @Get('orders/:orderId/shipment')
  async getShipmentByOrder(@Param('orderId') orderId: string) {
    return await this.logisticsService.getShipmentByOrderId(orderId);
  }

  /**
   * Update shipment status
   * PATCH /logistics/shipments/:id/status
   */
  @Patch('shipments/:id/status')
  @Roles('seller', 'admin', 'courier')
  async updateShipmentStatus(
    @Param('id') shipmentId: string,
    @Body() body: { status: ShipmentStatus; currentLocation?: string },
  ) {
    return await this.logisticsService.updateShipmentStatus(
      shipmentId,
      body.status,
      body.currentLocation,
    );
  }

  /**
   * Update tracking information
   * PATCH /logistics/shipments/:id/tracking
   */
  @Patch('shipments/:id/tracking')
  @Roles('seller', 'admin', 'courier')
  async updateTracking(
    @Param('id') shipmentId: string,
    @Body() body: { currentLocation: string; notes?: string },
  ) {
    return await this.logisticsService.updateTracking(
      shipmentId,
      body.currentLocation,
      body.notes,
    );
  }

  /**
   * Get shipments by courier
   * GET /logistics/couriers/:courierName/shipments
   */
  @Get('couriers/:courierName/shipments')
  @Roles('admin', 'courier')
  async getShipmentsByCourier(
    @Param('courierName') courierName: string,
    @Query('status') status?: ShipmentStatus,
  ) {
    return await this.logisticsService.getShipmentsByCourier(courierName, status);
  }

  /**
   * Assign courier to shipment
   * POST /logistics/shipments/:id/assign-courier
   */
  @Post('shipments/:id/assign-courier')
  @Roles('admin')
  async assignCourier(
    @Param('id') shipmentId: string,
    @Body() body: { courierName: string; trackingCode: string },
  ) {
    return await this.logisticsService.assignCourier(
      shipmentId,
      body.courierName,
      body.trackingCode,
    );
  }

  /**
   * Mark shipment as out for delivery
   * POST /logistics/shipments/:id/out-for-delivery
   */
  @Post('shipments/:id/out-for-delivery')
  @Roles('courier', 'admin')
  async markOutForDelivery(
    @Param('id') shipmentId: string,
    @Body() body: { courierPhone?: string },
  ) {
    return await this.logisticsService.markOutForDelivery(
      shipmentId,
      body.courierPhone,
    );
  }

  /**
   * Mark shipment as delivered
   * POST /logistics/shipments/:id/delivered
   */
  @Post('shipments/:id/delivered')
  @Roles('courier', 'admin')
  async markDelivered(
    @Param('id') shipmentId: string,
    @Body() body: { deliveryProof?: string },
  ) {
    return await this.logisticsService.markDelivered(shipmentId, body.deliveryProof);
  }

  /**
   * Mark delivery as failed
   * POST /logistics/shipments/:id/failed
   */
  @Post('shipments/:id/failed')
  @Roles('courier', 'admin')
  async markDeliveryFailed(
    @Param('id') shipmentId: string,
    @Body() body: { reason: string },
  ) {
    return await this.logisticsService.markDeliveryFailed(shipmentId, body.reason);
  }

  /**
   * Get shipment statistics
   * GET /logistics/stats
   */
  @Get('stats')
  @Roles('admin')
  async getShipmentStats() {
    return await this.logisticsService.getShipmentStats();
  }

  /**
   * Get shipment history
   * GET /logistics/shipments/:id/history
   */
  @Get('shipments/:id/history')
  async getShipmentHistory(@Param('id') shipmentId: string) {
    return await this.logisticsService.getShipmentHistory(shipmentId);
  }
}
