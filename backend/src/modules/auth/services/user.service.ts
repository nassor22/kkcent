import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../../database/entities';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createOrGetUser(phone: string, roles: UserRole[] = [UserRole.BUYER]) {
    let user = await this.userRepository.findOne({ where: { phone } });

    if (!user) {
      user = this.userRepository.create({
        id: uuid(),
        phone,
        roles: roles.length > 0 ? roles : [UserRole.BUYER],
        status: UserStatus.ACTIVE,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  async getUserById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserByPhone(phone: string) {
    return this.userRepository.findOne({ where: { phone } });
  }

  async updateUser(id: string, updates: Partial<User>) {
    await this.userRepository.update(id, updates);
    return this.getUserById(id);
  }

  async addRole(userId: string, role: UserRole) {
    const user = await this.getUserById(userId);
    if (user && !user.roles.includes(role)) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }
    return user;
  }

  async setOTP(userId: string, otpCode: string, expirationSeconds: number) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expirationSeconds);

    await this.userRepository.update(userId, {
      otpCode,
      otpExpiresAt: expiresAt,
      otpAttempts: 0,
    });
  }

  async verifyOTP(userId: string, otpCode: string): Promise<boolean> {
    const user = await this.getUserById(userId);

    if (!user || !user.otpCode || user.otpCode !== otpCode) {
      return false;
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return false;
    }

    // Clear OTP after successful verification
    await this.userRepository.update(userId, {
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    });

    return true;
  }

  async incrementOTPAttempts(userId: string) {
    const user = await this.getUserById(userId);
    if (user) {
      await this.userRepository.update(userId, {
        otpAttempts: user.otpAttempts + 1,
      });
    }
  }

  async suspendUser(userId: string) {
    return this.updateUser(userId, { status: UserStatus.SUSPENDED });
  }

  async activateUser(userId: string) {
    return this.updateUser(userId, { status: UserStatus.ACTIVE });
  }
}
