# Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install & Setup (2 min)
```bash
cd /home/lonewolf/StudioProjects/kkcent/backend
npm install
cp .env.example .env
```

### Step 2: Start Database (1 min)
```bash
# Option A: Create local PostgreSQL
createdb marketplace

# Option B: Use Docker
docker-compose up -d
```

### Step 3: Run Server (1 min)
```bash
npm run start:dev
```

Server runs at: `http://localhost:3000`

### Step 4: Test API (1 min)
```bash
# Request OTP
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "256700000000"}'
```

Check console for OTP code.

---

## 📋 Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run start:prod         # Run production build
npm run lint               # Check code style
npm run format             # Auto-format code

# Database
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Testing
npm run test              # Run tests
npm run test:cov          # With coverage
npm run test:e2e          # End-to-end tests
```

---

## 🔐 Authentication Flow

### 1. Request OTP
```bash
POST /auth/request-otp
{
  "phone": "256700000000"
}
```

**Response:**
```json
{
  "userId": "uuid",
  "message": "OTP sent to your phone",
  "expiresIn": 300
}
```

### 2. Verify OTP (Check console logs for OTP in dev)
```bash
POST /auth/verify-otp
{
  "userId": "uuid-from-step-1",
  "otp": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "phone": "256700000000",
    "roles": ["buyer"]
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600
}
```

### 3. Use Access Token
```bash
Authorization: Bearer <accessToken>
```

### 4. Refresh Token (when expired)
```bash
POST /auth/refresh
{
  "refreshToken": "token-from-step-2"
}
```

---

## 🛍️ Buyer Flow Example

### 1. Register as Buyer
```bash
POST /auth/request-otp
POST /auth/verify-otp
```

### 2. Browse Products
```bash
GET /catalog/products?query=phone&priceMin=100000&priceMax=500000
```

### 3. Get Product Details
```bash
GET /catalog/products/{productId}
```

### 4. Create Order
```bash
POST /orders
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 1
    }
  ],
  "deliveryAddressId": "uuid"
}
```

**With Auth Header:**
```
Authorization: Bearer <accessToken>
```

### 5. Initiate Payment
```bash
POST /payments/initiate
{
  "orderId": "order-uuid",
  "provider": "COD"
}
```

---

## 🏪 Seller Flow Example

### 1. Register as Seller
```bash
POST /seller/register
{
  "shopName": "My Electronics Store",
  "address": "123 Main Street",
  "city": "Kampala"
}
```

**With Auth Header**

### 2. Submit KYC Documents
```bash
POST /seller/kyc
{
  "documentUrl": "https://example.com/kyc.pdf"
}
```

### 3. Check Seller Profile
```bash
GET /seller/profile
```

### 4. List Product
```bash
POST /seller/products
{
  "categoryId": "electronics",
  "title": "iPhone 15",
  "description": "Latest model with A17 chip",
  "basePrice": 450000
}
```

### 5. Manage Orders
```bash
# Confirm order
POST /seller/orders/{orderId}/confirm

# Pack order
POST /seller/orders/{orderId}/pack

# Ship order
POST /seller/orders/{orderId}/ship
{
  "trackingCode": "TRK123456"
}
```

### 6. Check Balance
```bash
GET /seller/balance
```

---

## 👨‍💼 Admin Flow Example

### 1. Review Pending Sellers
```bash
GET /admin/sellers
```

### 2. Approve Seller KYC
```bash
POST /admin/sellers/{sellerId}/approve
```

**With Auth Header as Admin**

### 3. Review Pending Products
```bash
GET /admin/products/pending
```

### 4. Approve Product
```bash
POST /admin/products/{productId}/approve
```

### 5. Manage Disputes
```bash
GET /admin/disputes

POST /admin/disputes/{disputeId}/resolve
{
  "resolution": "buyer_favored",
  "refundAmount": 450000,
  "notes": "Item was defective"
}
```

---

## 🗄️ Database Quick Reference

### Key Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| users | User accounts | id, phone, roles, status |
| seller_profiles | Seller data | id, shop_name, kyc_status, available_balance |
| products | Product listing | id, title, status, seller_id |
| product_variants | SKUs | id, sku, price, attributes |
| inventory | Stock levels | id, quantity_available, reserved_quantity |
| orders | Customer orders | id, buyer_id, status, total_amount |
| order_items | Order line items | id, order_id, variant_id, quantity |
| payments | Payment records | id, order_id, provider, status |
| disputes | Order disputes | id, order_id, status, resolution |

---

## 🔍 Useful Queries

### Check User
```sql
SELECT * FROM users WHERE phone = '256700000000';
```

### Check Seller
```sql
SELECT sp.*, u.phone FROM seller_profiles sp
JOIN users u ON sp.user_id = u.id;
```

### Check Orders
```sql
SELECT o.*, u.phone FROM orders o
JOIN users u ON o.buyer_id = u.id
ORDER BY o.created_at DESC;
```

### Check Payments
```sql
SELECT * FROM payments WHERE order_id = 'order-uuid';
```

---

## 🐛 Debugging Tips

### Enable Database Logging
```bash
# In .env
DB_LOGGING=true
```

### Check OTP in Dev
OTPs are logged to console in development mode:
```
[DEV] OTP for 256700000000: 123456
```

### View Request Logs
Enable request logging in main.ts or middleware

### Database Issues
```bash
# Reset database
dropdb marketplace
createdb marketplace
npm run migration:run
```

---

## 📦 Module Quick Reference

```
auth/        → Authentication & user management
catalog/     → Products & inventory
orders/      → Order management & checkout
payments/    → Payment processing & webhooks
sellers/     → Seller onboarding & profiles
admin/       → Platform moderation & approvals
disputes/    → Order disputes & resolution
logistics/   → [Ready for implementation]
notifications/ → [Ready for implementation]
```

---

## 🔑 Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=marketplace

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# OTP
OTP_EXPIRATION=300
OTP_RESEND_LIMIT=3

# Server
API_PORT=3000
NODE_ENV=development
```

---

## 🧪 Test Data

### Create Test Buyer
```json
{
  "phone": "256700000001"
}
```

### Create Test Seller
```json
{
  "phone": "256700000002",
  "shopName": "Test Shop",
  "address": "123 Test St"
}
```

### Create Test Product
```json
{
  "categoryId": "electronics",
  "title": "Test Product",
  "description": "A test product",
  "basePrice": 50000
}
```

---

## 🚨 Common Issues

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Database Connection Failed
- Check PostgreSQL is running
- Verify .env credentials
- Check DB_HOST and DB_PORT

### JWT Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

### Entity Not Found
- Check TypeORM synchronize in .env
- Verify entity exports in index.ts
- Check module imports

---

## 📞 Quick Help

### Get Seller Orders
```bash
# In seller service
async getSellerOrders(sellerId: string) {
  return this.orderItemRepository.find({
    where: { sellerId },
    relations: ['order']
  });
}
```

### Get User by Phone
```bash
# In user service
async getUserByPhone(phone: string) {
  return this.userRepository.findOne({
    where: { phone }
  });
}
```

### Check Order Items
```bash
SELECT oi.*, p.title FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 'order-uuid';
```

---

## 📚 Resources

- **NestJS Docs**: https://docs.nestjs.com
- **TypeORM Docs**: https://typeorm.io
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **JWT**: https://jwt.io

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Production Ready
