import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  NotificationsService,
  NotificationChannel,
  NotificationType,
  NotificationPayload,
} from '../services/notifications.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Send a single notification
   * POST /notifications/send
   */
  @Post('send')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Body() payload: NotificationPayload) {
    const result = await this.notificationsService.sendNotification(payload);
    return {
      success: result,
      message: result
        ? 'Notification sent successfully'
        : 'Failed to send notification',
    };
  }

  /**
   * Send OTP code
   * POST /notifications/send-otp
   */
  @Post('send-otp')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() body: { phone: string; code: string }) {
    const result = await this.notificationsService.sendOTP(body.phone, body.code);
    return {
      success: result,
      message: result ? 'OTP sent successfully' : 'Failed to send OTP',
    };
  }

  /**
   * Send order placed notification
   * POST /notifications/order-placed
   */
  @Post('order-placed')
  @Roles('admin', 'seller')
  @HttpCode(HttpStatus.OK)
  async notifyOrderPlaced(
    @Body() body: { buyerPhone: string; buyerEmail: string; orderRef: string },
  ) {
    await this.notificationsService.notifyOrderPlaced(
      body.buyerPhone,
      body.buyerEmail,
      body.orderRef,
    );
    return { success: true, message: 'Order notification sent' };
  }

  /**
   * Send order shipped notification
   * POST /notifications/order-shipped
   */
  @Post('order-shipped')
  @Roles('admin', 'seller')
  @HttpCode(HttpStatus.OK)
  async notifyOrderShipped(
    @Body()
    body: {
      buyerPhone: string;
      buyerEmail: string;
      orderRef: string;
      trackingCode: string;
    },
  ) {
    await this.notificationsService.notifyOrderShipped(
      body.buyerPhone,
      body.buyerEmail,
      body.orderRef,
      body.trackingCode,
    );
    return { success: true, message: 'Shipment notification sent' };
  }

  /**
   * Send order delivered notification
   * POST /notifications/order-delivered
   */
  @Post('order-delivered')
  @Roles('admin', 'seller')
  @HttpCode(HttpStatus.OK)
  async notifyOrderDelivered(
    @Body() body: { buyerPhone: string; buyerEmail: string; orderRef: string },
  ) {
    await this.notificationsService.notifyOrderDelivered(
      body.buyerPhone,
      body.buyerEmail,
      body.orderRef,
    );
    return { success: true, message: 'Delivery notification sent' };
  }

  /**
   * Send payment success notification
   * POST /notifications/payment-success
   */
  @Post('payment-success')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async notifyPaymentSuccess(
    @Body()
    body: {
      buyerPhone: string;
      buyerEmail: string;
      orderRef: string;
      amount: number;
    },
  ) {
    await this.notificationsService.notifyPaymentSuccess(
      body.buyerPhone,
      body.buyerEmail,
      body.orderRef,
      body.amount,
    );
    return { success: true, message: 'Payment success notification sent' };
  }

  /**
   * Send payment failed notification
   * POST /notifications/payment-failed
   */
  @Post('payment-failed')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async notifyPaymentFailed(
    @Body() body: { buyerPhone: string; buyerEmail: string; orderRef: string },
  ) {
    await this.notificationsService.notifyPaymentFailed(
      body.buyerPhone,
      body.buyerEmail,
      body.orderRef,
    );
    return { success: true, message: 'Payment failed notification sent' };
  }

  /**
   * Send seller approved notification
   * POST /notifications/seller-approved
   */
  @Post('seller-approved')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async notifySellerApproved(
    @Body() body: { sellerPhone: string; sellerEmail: string },
  ) {
    await this.notificationsService.notifySellerApproved(
      body.sellerPhone,
      body.sellerEmail,
    );
    return { success: true, message: 'Seller approval notification sent' };
  }

  /**
   * Send seller rejected notification
   * POST /notifications/seller-rejected
   */
  @Post('seller-rejected')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async notifySellerRejected(
    @Body() body: { sellerPhone: string; sellerEmail: string; reason: string },
  ) {
    await this.notificationsService.notifySellerRejected(
      body.sellerPhone,
      body.sellerEmail,
      body.reason,
    );
    return { success: true, message: 'Seller rejection notification sent' };
  }

  /**
   * Send product approved notification
   * POST /notifications/product-approved
   */
  @Post('product-approved')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async notifyProductApproved(
    @Body()
    body: { sellerPhone: string; sellerEmail: string; productName: string },
  ) {
    await this.notificationsService.notifyProductApproved(
      body.sellerPhone,
      body.sellerEmail,
      body.productName,
    );
    return { success: true, message: 'Product approval notification sent' };
  }

  /**
   * Send dispute opened notification
   * POST /notifications/dispute-opened
   */
  @Post('dispute-opened')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async notifyDisputeOpened(
    @Body() body: { sellerPhone: string; sellerEmail: string; orderRef: string },
  ) {
    await this.notificationsService.notifyDisputeOpened(
      body.sellerPhone,
      body.sellerEmail,
      body.orderRef,
    );
    return { success: true, message: 'Dispute notification sent' };
  }

  /**
   * Send payout completed notification
   * POST /notifications/payout-completed
   */
  @Post('payout-completed')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async notifyPayoutCompleted(
    @Body() body: { sellerPhone: string; sellerEmail: string; amount: number },
  ) {
    await this.notificationsService.notifyPayoutCompleted(
      body.sellerPhone,
      body.sellerEmail,
      body.amount,
    );
    return { success: true, message: 'Payout notification sent' };
  }

  /**
   * Send bulk notifications
   * POST /notifications/bulk
   */
  @Post('bulk')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendBulkNotifications(
    @Body()
    body: {
      recipients: string[];
      channel: NotificationChannel;
      message: string;
      subject?: string;
    },
  ) {
    const result = await this.notificationsService.sendBulkNotifications(
      body.recipients,
      body.channel,
      body.message,
      body.subject,
    );
    return {
      success: true,
      message: 'Bulk notifications sent',
      stats: result,
    };
  }
}
