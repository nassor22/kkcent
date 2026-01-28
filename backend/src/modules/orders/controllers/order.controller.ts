import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createOrder(
    @CurrentUser() user: any,
    @Body()
    body: {
      items: Array<{ productId: string; variantId: string; quantity: number }>;
      deliveryAddressId?: string;
    },
  ) {
    return this.orderService.createOrder(user.sub, body.items, body.deliveryAddressId);
  }

  @Get('my-orders')
  @UseGuards(JwtGuard)
  async getMyOrders(@CurrentUser() user: any) {
    return this.orderService.getOrdersByBuyer(user.sub);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtGuard)
  async cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Post(':id/return')
  @UseGuards(JwtGuard)
  async requestReturn(
    @Param('id') id: string,
    @Body() body: { reason: string; description?: string },
  ) {
    // TODO: Implement return request logic
    return { message: 'Return request submitted' };
  }

  @Post(':id/review')
  @UseGuards(JwtGuard)
  async submitReview(
    @Param('id') id: string,
    @Body() body: { productId: string; rating: number; comment?: string },
  ) {
    // TODO: Implement review logic
    return { message: 'Review submitted' };
  }
}
