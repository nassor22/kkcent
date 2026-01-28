import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DisputeService } from '../services/dispute.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @UseGuards(JwtGuard)
  async openDispute(
    @Body()
    body: {
      orderId: string;
      reason: string;
      description?: string;
      attachmentUrls?: string[];
    },
  ) {
    return this.disputeService.openDispute(
      body.orderId,
      body.reason,
      body.description,
      body.attachmentUrls,
    );
  }

  @Get(':id')
  async getDispute(@Param('id') id: string) {
    return this.disputeService.getDispute(id);
  }

  @Get()
  async getAllDisputes() {
    return this.disputeService.getAllDisputes();
  }

  @Post(':id/resolve')
  @UseGuards(JwtGuard)
  async resolveDispute(
    @Param('id') id: string,
    @Body()
    body: {
      resolution: string;
      refundAmount?: number;
      notes?: string;
    },
  ) {
    return this.disputeService.resolveDispute(id, body.resolution as any, body.refundAmount, body.notes);
  }
}
