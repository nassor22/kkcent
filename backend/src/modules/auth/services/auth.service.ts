import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { UserRole } from '../../../database/entities';
import * as crypto from 'crypto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async requestOTP(phone: string) {
    // Validate phone format (basic validation)
    if (!phone || phone.length < 10) {
      throw new Error('Invalid phone number');
    }

    // Create or get user
    const user = await this.userService.createOrGetUser(phone);

    // Generate OTP
    const otp = this.generateOTP();
    const otpExpirationSeconds = this.configService.get<number>('otp.expirationTime') || 300;

    // Save OTP
    await this.userService.setOTP(user.id, otp, otpExpirationSeconds);

    // In production, send OTP via SMS
    console.log(`[DEV] OTP for ${phone}: ${otp}`);

    return {
      userId: user.id,
      message: 'OTP sent to your phone',
      expiresIn: otpExpirationSeconds,
    };
  }

  async verifyOTP(userId: string, otpCode: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await this.userService.verifyOTP(userId, otpCode);
    if (!isValid) {
      await this.userService.incrementOTPAttempts(userId);
      throw new Error('Invalid or expired OTP');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        roles: user.roles,
      },
      ...tokens,
    };
  }

  async generateTokens(user: any): Promise<AuthTokens> {
    const jwtSecret = this.configService.get<string>('jwt.secret');
    const jwtExpiration = this.configService.get<number>('jwt.expirationTime');

    const payload = {
      sub: user.id,
      phone: user.phone,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiration,
    });

    // Refresh token (longer validity)
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtExpiration,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const jwtSecret = this.configService.get<string>('jwt.secret');
      const decoded = this.jwtService.verify(refreshToken, { secret: jwtSecret });
      const user = await this.userService.getUserById(decoded.sub);

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async verifyToken(token: string) {
    try {
      const jwtSecret = this.configService.get<string>('jwt.secret');
      return this.jwtService.verify(token, { secret: jwtSecret });
    } catch (error) {
      return null;
    }
  }
}
