import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @UseGuards(JwtGuard)
  async initiatePayment(
    @CurrentUser() user: any,
    @Body() body: { orderId: string; provider?: string },
  ) {
    return this.paymentService.initiatePayment(body.orderId, body.provider || 'COD');
  }

  @Post('webhooks/cod')
  async handleCODWebhook(@Body() body: any) {
    if (!body.reference) {
      throw new BadRequestException('Payment reference required');
    }

    return this.paymentService.handleWebhook('COD', body);
  }

  @Post('webhooks/mtn')
  async handleMTNWebhook(@Body() body: any) {
    if (!body.reference) {
      throw new BadRequestException('Payment reference required');
    }

    return this.paymentService.handleWebhook('MTN', body);
  }

  @Post('webhooks/airtel')
  async handleAirtelWebhook(@Body() body: any) {
    if (!body.reference) {
      throw new BadRequestException('Payment reference required');
    }

    return this.paymentService.handleWebhook('Airtel', body);
  }
}
