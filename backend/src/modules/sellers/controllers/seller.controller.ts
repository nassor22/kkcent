import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { SellerService } from '../services/seller.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Post('register')
  @UseGuards(JwtGuard)
  async registerSeller(
    @CurrentUser() user: any,
    @Body() body: { shopName: string; address: string; city?: string },
  ) {
    return this.sellerService.registerSeller(user.sub, body.shopName, body.address, body.city);
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.sellerService.getSellerProfile(user.sub);
  }

  @Post('kyc')
  @UseGuards(JwtGuard)
  async submitKYC(@CurrentUser() user: any, @Body() body: { documentUrl: string }) {
    return this.sellerService.submitKYC(user.sub, body.documentUrl);
  }

  @Get('balance')
  @UseGuards(JwtGuard)
  async getBalance(@CurrentUser() user: any) {
    return this.sellerService.getSellerBalance(user.sub);
  }

  @Get('payouts')
  @UseGuards(JwtGuard)
  async getPayouts(@CurrentUser() user: any) {
    // TODO: Implement payouts endpoint
    return { payouts: [] };
  }

  @Post('products')
  @UseGuards(JwtGuard)
  async createProduct(
    @CurrentUser() user: any,
    @Body()
    body: {
      categoryId: string;
      title: string;
      description: string;
      basePrice: number;
    },
  ) {
    // TODO: Implement product creation
    return { message: 'Product created' };
  }

  @Post('orders/:orderId/confirm')
  @UseGuards(JwtGuard)
  async confirmOrder(@Param('orderId') orderId: string) {
    // TODO: Implement order confirmation
    return { message: 'Order confirmed' };
  }

  @Post('orders/:orderId/pack')
  @UseGuards(JwtGuard)
  async packOrder(@Param('orderId') orderId: string) {
    // TODO: Implement order packing
    return { message: 'Order packed' };
  }

  @Post('orders/:orderId/ship')
  @UseGuards(JwtGuard)
  async shipOrder(@Param('orderId') orderId: string, @Body() body: { trackingCode?: string }) {
    // TODO: Implement order shipping
    return { message: 'Order shipped' };
  }
}
