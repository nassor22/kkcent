import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Seller Management
  @Get('sellers')
  @UseGuards(JwtGuard)
  async getAllSellers(@CurrentUser() user: any) {
    return this.adminService.getAllSellers();
  }

  @Post('sellers/:id/approve')
  @UseGuards(JwtGuard)
  async approveSeller(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.approveSeller(id, user.sub);
  }

  @Post('sellers/:id/reject')
  @UseGuards(JwtGuard)
  async rejectSeller(@Param('id') id: string, @Body() body: { reason: string }, @CurrentUser() user: any) {
    return this.adminService.rejectSeller(id, user.sub, body.reason);
  }

  @Post('sellers/:id/suspend')
  @UseGuards(JwtGuard)
  async suspendSeller(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    return this.adminService.suspendSeller(id, user.sub, body.reason);
  }

  // Product Management
  @Get('products/pending')
  @UseGuards(JwtGuard)
  async getPendingProducts(@CurrentUser() user: any) {
    return this.adminService.getPendingProducts();
  }

  @Get('products')
  @UseGuards(JwtGuard)
  async getAllProducts(@CurrentUser() user: any) {
    return this.adminService.getAllProducts();
  }

  @Post('products/:id/approve')
  @UseGuards(JwtGuard)
  async approveProduct(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.approveProduct(id, user.sub);
  }

  @Post('products/:id/reject')
  @UseGuards(JwtGuard)
  async rejectProduct(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    return this.adminService.rejectProduct(id, user.sub, body.reason);
  }

  // Moderation Logs
  @Get('logs')
  @UseGuards(JwtGuard)
  async getModerationLogs(@CurrentUser() user: any) {
    return this.adminService.getModerationLogs();
  }

  @Get('disputes')
  @UseGuards(JwtGuard)
  async getDisputes(@CurrentUser() user: any) {
    // TODO: Implement disputes endpoint
    return { disputes: [] };
  }

  @Post('disputes/:id/resolve')
  @UseGuards(JwtGuard)
  async resolveDispute(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    // TODO: Implement dispute resolution
    return { message: 'Dispute resolved' };
  }
}
