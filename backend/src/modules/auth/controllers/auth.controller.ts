import { Controller, Post, Body, HttpCode, BadRequestException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(200)
  async requestOTP(@Body() body: { phone: string }) {
    if (!body.phone) {
      throw new BadRequestException('Phone number is required');
    }
    return this.authService.requestOTP(body.phone);
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOTP(@Body() body: { userId: string; otp: string }) {
    if (!body.userId || !body.otp) {
      throw new BadRequestException('UserId and OTP are required');
    }
    return this.authService.verifyOTP(body.userId, body.otp);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshTokens(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
