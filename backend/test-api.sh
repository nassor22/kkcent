#!/bin/bash

# Marketplace Backend API Test Script

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "  Marketplace Backend API Tests"
echo "=========================================="
echo ""

# Test 1: Request OTP
echo "1. Testing OTP Request..."
OTP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/request-otp" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+256700000001"}')
echo "Response: $OTP_RESPONSE"
echo ""

# Extract OTP code from database for testing
echo "2. Getting OTP from database..."
OTP_CODE=$(sudo -u postgres psql -d marketplace -t -c "SELECT otp_code FROM users WHERE phone = '+256700000001' ORDER BY created_at DESC LIMIT 1" | xargs)
echo "OTP Code: $OTP_CODE"
echo ""

# Test 3: Verify OTP
if [ ! -z "$OTP_CODE" ]; then
  echo "3. Testing OTP Verification..."
  AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify-otp" \
    -H "Content-Type: application/json" \
    -d "{\"phone\": \"+256700000001\", \"code\": \"$OTP_CODE\"}")
  echo "Response: $AUTH_RESPONSE"
  
  # Extract access token
  ACCESS_TOKEN=$(echo $AUTH_RESPONSE | jq -r '.accessToken // empty')
  echo "Access Token: ${ACCESS_TOKEN:0:50}..."
  echo ""
fi

# Test 4: Get Categories (no auth required)
echo "4. Testing Get Categories..."
CATEGORIES_RESPONSE=$(curl -s -X GET "$BASE_URL/catalog/categories")
echo "Response: $CATEGORIES_RESPONSE"
echo ""

# Test 5: Get Products (no auth required)
echo "5. Testing Get Products..."
PRODUCTS_RESPONSE=$(curl -s -X GET "$BASE_URL/catalog/products?limit=5")
echo "Response: $PRODUCTS_RESPONSE"
echo ""

# Test with authentication if we have a token
if [ ! -z "$ACCESS_TOKEN" ] && [ "$ACCESS_TOKEN" != "null" ]; then
  echo "6. Testing Authenticated Endpoint (Get My Orders)..."
  MY_ORDERS_RESPONSE=$(curl -s -X GET "$BASE_URL/orders/my-orders" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "Response: $MY_ORDERS_RESPONSE"
  echo ""
  
  echo "7. Testing Seller Registration..."
  SELLER_RESPONSE=$(curl -s -X POST "$BASE_URL/seller/register" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "shopName": "Test Shop",
      "shopDescription": "A test marketplace shop",
      "address": "123 Test Street",
      "city": "Kampala",
      "region": "Central",
      "payoutMethod": "mobile_money",
      "payoutDestination": "+256700000001"
    }')
  echo "Response: $SELLER_RESPONSE"
  echo ""
fi

echo "=========================================="
echo "  Tests Complete"
echo "=========================================="
