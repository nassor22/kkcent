import { Injectable, Logger } from '@nestjs/common';

export enum NotificationChannel {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
}

export enum NotificationType {
  ORDER_PLACED = 'order_placed',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  SELLER_APPROVED = 'seller_approved',
  SELLER_REJECTED = 'seller_rejected',
  PRODUCT_APPROVED = 'product_approved',
  PRODUCT_REJECTED = 'product_rejected',
  DISPUTE_OPENED = 'dispute_opened',
  DISPUTE_RESOLVED = 'dispute_resolved',
  PAYOUT_INITIATED = 'payout_initiated',
  PAYOUT_COMPLETED = 'payout_completed',
  RETURN_REQUESTED = 'return_requested',
  RETURN_APPROVED = 'return_approved',
  OTP_CODE = 'otp_code',
}

export interface NotificationPayload {
  recipient: string; // phone, email, or device token
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * Send a notification through the specified channel
   */
  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    this.logger.log(
      `Sending ${payload.type} notification via ${payload.channel} to ${payload.recipient}`,
    );

    try {
      switch (payload.channel) {
        case NotificationChannel.SMS:
          return await this.sendSMS(payload);
        case NotificationChannel.EMAIL:
          return await this.sendEmail(payload);
        case NotificationChannel.PUSH:
          return await this.sendPushNotification(payload);
        case NotificationChannel.WHATSAPP:
          return await this.sendWhatsApp(payload);
        default:
          this.logger.warn(`Unsupported notification channel: ${payload.channel}`);
          return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to send notification: ${errorMessage}`,
        errorStack,
      );
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(payload: NotificationPayload): Promise<boolean> {
    // TODO: Integrate with SMS provider (Twilio, Africa's Talking, etc.)
    this.logger.log(`[SMS] To: ${payload.recipient}, Message: ${payload.message}`);
    
    // Simulate SMS sending
    // In production, integrate with actual SMS provider:
    // const result = await this.smsProvider.send({
    //   to: payload.recipient,
    //   message: payload.message,
    // });
    
    return true;
  }

  /**
   * Send email notification
   */
  private async sendEmail(payload: NotificationPayload): Promise<boolean> {
    // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
    this.logger.log(
      `[EMAIL] To: ${payload.recipient}, Subject: ${payload.subject}, Message: ${payload.message}`,
    );
    
    // Simulate email sending
    // In production, integrate with actual email provider:
    // const result = await this.emailProvider.send({
    //   to: payload.recipient,
    //   subject: payload.subject,
    //   html: payload.message,
    // });
    
    return true;
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(payload: NotificationPayload): Promise<boolean> {
    // TODO: Integrate with FCM (Firebase Cloud Messaging)
    this.logger.log(
      `[PUSH] To: ${payload.recipient}, Title: ${payload.subject}, Body: ${payload.message}`,
    );
    
    // Simulate push notification
    // In production, integrate with FCM:
    // const result = await this.fcm.send({
    //   token: payload.recipient,
    //   notification: {
    //     title: payload.subject,
    //     body: payload.message,
    //   },
    //   data: payload.data,
    // });
    
    return true;
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
    // TODO: Integrate with WhatsApp Business API
    this.logger.log(
      `[WHATSAPP] To: ${payload.recipient}, Message: ${payload.message}`,
    );
    
    // Simulate WhatsApp sending
    // In production, integrate with WhatsApp Business API:
    // const result = await this.whatsappProvider.send({
    //   to: payload.recipient,
    //   message: payload.message,
    // });
    
    return true;
  }

  /**
   * Send OTP code
   */
  async sendOTP(phone: string, code: string): Promise<boolean> {
    const message = `Your verification code is: ${code}. Valid for 10 minutes.`;
    return await this.sendNotification({
      recipient: phone,
      channel: NotificationChannel.SMS,
      type: NotificationType.OTP_CODE,
      message,
    });
  }

  /**
   * Notify buyer about order placement
   */
  async notifyOrderPlaced(
    buyerPhone: string,
    buyerEmail: string,
    orderRef: string,
  ): Promise<void> {
    const message = `Your order ${orderRef} has been placed successfully. We'll notify you when it's confirmed.`;

    // Send both SMS and email
    await Promise.all([
      this.sendNotification({
        recipient: buyerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.ORDER_PLACED,
        message,
      }),
      this.sendNotification({
        recipient: buyerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.ORDER_PLACED,
        subject: 'Order Placed Successfully',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify seller about new order
   */
  async notifySellerNewOrder(
    sellerPhone: string,
    sellerEmail: string,
    orderRef: string,
  ): Promise<void> {
    const message = `You have a new order ${orderRef}. Please confirm and prepare for shipment.`;

    await Promise.all([
      this.sendNotification({
        recipient: sellerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.ORDER_PLACED,
        message,
      }),
      this.sendNotification({
        recipient: sellerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.ORDER_PLACED,
        subject: 'New Order Received',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify about order shipment
   */
  async notifyOrderShipped(
    buyerPhone: string,
    buyerEmail: string,
    orderRef: string,
    trackingCode: string,
  ): Promise<void> {
    const message = `Your order ${orderRef} has been shipped. Tracking code: ${trackingCode}`;

    await Promise.all([
      this.sendNotification({
        recipient: buyerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.ORDER_SHIPPED,
        message,
      }),
      this.sendNotification({
        recipient: buyerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.ORDER_SHIPPED,
        subject: 'Order Shipped',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify about order delivery
   */
  async notifyOrderDelivered(
    buyerPhone: string,
    buyerEmail: string,
    orderRef: string,
  ): Promise<void> {
    const message = `Your order ${orderRef} has been delivered. Thank you for shopping with us!`;

    await Promise.all([
      this.sendNotification({
        recipient: buyerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.ORDER_DELIVERED,
        message,
      }),
      this.sendNotification({
        recipient: buyerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.ORDER_DELIVERED,
        subject: 'Order Delivered',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify about payment success
   */
  async notifyPaymentSuccess(
    buyerPhone: string,
    buyerEmail: string,
    orderRef: string,
    amount: number,
  ): Promise<void> {
    const message = `Payment of ${amount} for order ${orderRef} was successful.`;

    await Promise.all([
      this.sendNotification({
        recipient: buyerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.PAYMENT_SUCCESS,
        message,
      }),
      this.sendNotification({
        recipient: buyerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.PAYMENT_SUCCESS,
        subject: 'Payment Successful',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify about payment failure
   */
  async notifyPaymentFailed(
    buyerPhone: string,
    buyerEmail: string,
    orderRef: string,
  ): Promise<void> {
    const message = `Payment for order ${orderRef} failed. Please try again.`;

    await Promise.all([
      this.sendNotification({
        recipient: buyerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.PAYMENT_FAILED,
        message,
      }),
      this.sendNotification({
        recipient: buyerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.PAYMENT_FAILED,
        subject: 'Payment Failed',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify seller about approval
   */
  async notifySellerApproved(
    sellerPhone: string,
    sellerEmail: string,
  ): Promise<void> {
    const message = 'Congratulations! Your seller account has been approved. You can now start listing products.';

    await Promise.all([
      this.sendNotification({
        recipient: sellerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.SELLER_APPROVED,
        message,
      }),
      this.sendNotification({
        recipient: sellerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.SELLER_APPROVED,
        subject: 'Seller Account Approved',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify seller about rejection
   */
  async notifySellerRejected(
    sellerPhone: string,
    sellerEmail: string,
    reason: string,
  ): Promise<void> {
    const message = `Your seller application was not approved. Reason: ${reason}`;

    await Promise.all([
      this.sendNotification({
        recipient: sellerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.SELLER_REJECTED,
        message,
      }),
      this.sendNotification({
        recipient: sellerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.SELLER_REJECTED,
        subject: 'Seller Application Status',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify about product approval
   */
  async notifyProductApproved(
    sellerPhone: string,
    sellerEmail: string,
    productName: string,
  ): Promise<void> {
    const message = `Your product "${productName}" has been approved and is now live.`;

    await Promise.all([
      this.sendNotification({
        recipient: sellerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.PRODUCT_APPROVED,
        message,
      }),
      this.sendNotification({
        recipient: sellerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.PRODUCT_APPROVED,
        subject: 'Product Approved',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify about dispute
   */
  async notifyDisputeOpened(
    sellerPhone: string,
    sellerEmail: string,
    orderRef: string,
  ): Promise<void> {
    const message = `A dispute has been opened for order ${orderRef}. Please check your dashboard.`;

    await Promise.all([
      this.sendNotification({
        recipient: sellerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.DISPUTE_OPENED,
        message,
      }),
      this.sendNotification({
        recipient: sellerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.DISPUTE_OPENED,
        subject: 'Dispute Opened',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Notify about payout
   */
  async notifyPayoutCompleted(
    sellerPhone: string,
    sellerEmail: string,
    amount: number,
  ): Promise<void> {
    const message = `Your payout of ${amount} has been processed successfully.`;

    await Promise.all([
      this.sendNotification({
        recipient: sellerPhone,
        channel: NotificationChannel.SMS,
        type: NotificationType.PAYOUT_COMPLETED,
        message,
      }),
      this.sendNotification({
        recipient: sellerEmail,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.PAYOUT_COMPLETED,
        subject: 'Payout Completed',
        message: `<p>${message}</p>`,
      }),
    ]);
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    recipients: string[],
    channel: NotificationChannel,
    message: string,
    subject?: string,
  ): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
      recipients.map((recipient) =>
        this.sendNotification({
          recipient,
          channel,
          type: NotificationType.ORDER_PLACED, // Generic type for bulk
          message,
          subject,
        }),
      ),
    );

    const success = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(`Bulk notification complete: ${success} success, ${failed} failed`);

    return { success, failed };
  }
}
