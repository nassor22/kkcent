import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import appConfig from './config/app.config';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { AdminModule } from './modules/admin/admin.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async () => databaseConfig(),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-in-production',
        signOptions: { expiresIn: parseInt(configService.get<string>('JWT_EXPIRATION') || '3600') },
      }),
    }),
    AuthModule,
    CatalogModule,
    OrdersModule,
    PaymentsModule,
    SellersModule,
    AdminModule,
    DisputesModule,
    LogisticsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
