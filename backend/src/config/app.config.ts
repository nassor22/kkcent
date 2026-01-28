export default () => ({
  port: parseInt(process.env.API_PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'marketplace',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expirationTime: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
  },
  otp: {
    expirationTime: parseInt(process.env.OTP_EXPIRATION || '300', 10),
    resendLimit: parseInt(process.env.OTP_RESEND_LIMIT || '3', 10),
    resendWindow: parseInt(process.env.OTP_RESEND_WINDOW || '60', 10),
  },
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    path: process.env.STORAGE_PATH || './uploads',
  },
  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'COD',
    mobileMoneyProvider: process.env.MOBILE_MONEY_PROVIDER || 'mtn',
  },
});
