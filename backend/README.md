# Marketplace Backend API

A Jumia-style managed marketplace backend built with NestJS, PostgreSQL, and TypeORM.

## Architecture Overview

This is a modular monolith designed to scale into microservices. The main components include:

- **Auth Module**: OTP-based authentication with JWT tokens
- **Catalog Module**: Product management, search, and inventory
- **Orders Module**: Order lifecycle management with state machine
- **Payments Module**: Payment processing with webhook support
- **Sellers Module**: Seller onboarding and profile management
- **Admin Module**: Platform moderation and content approval
- **Disputes Module**: Order disputes and resolution

## Technology Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + OTP
- **Validation**: class-validator
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Update `.env` with your database credentials and configuration

### Database Setup

1. Ensure PostgreSQL is running
2. Create database:

```bash
createdb marketplace
```

3. Run migrations (TypeORM synchronize enabled in development):

```bash
npm run migration:run
```

### Running the Application

Development:

```bash
npm run start:dev
```

Production:

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- `POST /auth/request-otp` - Request OTP for phone
- `POST /auth/verify-otp` - Verify OTP and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout

### Catalog

- `GET /catalog/categories` - Get all categories
- `GET /catalog/products` - Search products (supports filters)
- `GET /catalog/products/:id` - Get product details
- `POST /catalog/products` - Create product (seller only)

### Orders

- `POST /orders` - Create order
- `GET /orders/my-orders` - Get buyer's orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/cancel` - Cancel order
- `POST /orders/:id/return` - Request return
- `POST /orders/:id/review` - Submit review

### Payments

- `POST /payments/initiate` - Initiate payment
- `POST /payments/webhooks/cod` - Cash on Delivery webhook
- `POST /payments/webhooks/mtn` - MTN Mobile Money webhook
- `POST /payments/webhooks/airtel` - Airtel Money webhook

### Seller

- `POST /seller/register` - Register as seller
- `GET /seller/profile` - Get seller profile
- `POST /seller/kyc` - Submit KYC documents
- `GET /seller/balance` - Get account balance
- `GET /seller/payouts` - Get payout history
- `POST /seller/products` - List product
- `POST /seller/orders/:id/confirm` - Confirm order
- `POST /seller/orders/:id/pack` - Pack order
- `POST /seller/orders/:id/ship` - Ship order

### Admin

- `GET /admin/sellers` - Get all sellers
- `POST /admin/sellers/:id/approve` - Approve seller KYC
- `POST /admin/sellers/:id/reject` - Reject seller KYC
- `POST /admin/sellers/:id/suspend` - Suspend seller
- `GET /admin/products/pending` - Get pending products
- `GET /admin/products` - Get all products
- `POST /admin/products/:id/approve` - Approve product
- `POST /admin/products/:id/reject` - Reject product
- `GET /admin/logs` - Get moderation logs
- `GET /admin/disputes` - Get disputes
- `POST /admin/disputes/:id/resolve` - Resolve dispute

### Disputes

- `POST /disputes` - Open dispute
- `GET /disputes/:id` - Get dispute
- `GET /disputes` - Get all disputes
- `POST /disputes/:id/resolve` - Resolve dispute

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Authentication & authorization
│   │   ├── catalog/           # Product catalog & search
│   │   ├── orders/            # Order management
│   │   ├── payments/          # Payment processing
│   │   ├── sellers/           # Seller management
│   │   ├── admin/             # Admin panel
│   │   ├── disputes/          # Dispute resolution
│   │   ├── logistics/         # Delivery & tracking
│   │   └── notifications/     # Notifications
│   ├── database/
│   │   ├── entities/          # TypeORM entities
│   │   └── migrations/        # Database migrations
│   ├── common/
│   │   ├── decorators/        # Custom decorators
│   │   ├── guards/            # Auth guards
│   │   └── interceptors/      # HTTP interceptors
│   ├── config/                # Configuration files
│   ├── app.module.ts          # Main application module
│   └── main.ts                # Application entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Key Features

### Order State Machine

Implemented states:
- DRAFT → PENDING_PAYMENT → PLACED → PAID → CONFIRMED → PACKED → SHIPPED → DELIVERED
- Support for cancellation, returns, refunds, and disputes
- Automatic inventory reservation and release

### Inventory Management

- Reserve stock at checkout
- Release on payment failure or timeout
- Confirm sale on payment success
- Track available, reserved, and sold quantities

### Payment Processing

Supported methods:
- Cash on Delivery (COD)
- Mobile Money (MTN, Airtel, Vodafone)
- Card payments (can be added)

### Authentication

- Phone-based OTP login
- JWT access tokens (short-lived)
- Refresh tokens (long-lived)
- Role-based access control (BUYER, SELLER, ADMIN)

## Future Enhancements

- [ ] Search index integration (Meilisearch/Elasticsearch)
- [ ] Message queue (RabbitMQ/SQS) for async events
- [ ] Push notifications (FCM)
- [ ] SMS integration
- [ ] Advanced logistics integration
- [ ] Recommendation engine
- [ ] Analytics dashboard
- [ ] Microservices split
- [ ] Caching layer (Redis)

## Security Considerations

- Always verify webhook signatures
- Use HTTPS in production
- Encrypt sensitive data (PII)
- Implement rate limiting on OTP requests
- Validate all user inputs
- Use environment variables for secrets
- Implement audit logging for admin actions

## Testing

Run tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## Deployment

### Docker

Build image:

```bash
docker build -t marketplace-backend .
```

Run container:

```bash
docker run -e DATABASE_URL=postgres://... -p 3000:3000 marketplace-backend
```

### Environment Variables

See `.env.example` for all available configuration options.

## License

Proprietary - All rights reserved
