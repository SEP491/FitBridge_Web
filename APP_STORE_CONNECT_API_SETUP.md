# App Store Connect API Integration Guide

## Overview

This guide explains how to integrate App Store Connect API to programmatically set subscription prices without manually accessing App Store Connect.

## Prerequisites

1. App Store Connect API Key (.p8 file)
2. Key ID (from App Store Connect)
3. Issuer ID (from App Store Connect)
4. Backend server to handle JWT token generation

## Backend Endpoint Required

Create a backend endpoint to handle App Store Connect API calls:

### Endpoint: `POST /api/app-store-connect/set-subscription-price`

**Request Body:**

```json
{
  "productId": "prod_abc123",
  "storeIdentifier": "com.app.monthly",
  "price": 9.99,
  "territory": "USA",
  "subscriptionGroupName": "Premium Subscriptions"
}
```

**Backend Implementation Steps:**

1. **Generate JWT Token:**

   ```javascript
   // Using jsonwebtoken library
   const jwt = require("jsonwebtoken");
   const fs = require("fs");

   const privateKey = fs.readFileSync("AuthKey_XXXXXXXXXX.p8");
   const keyId = "YOUR_KEY_ID";
   const issuerId = "YOUR_ISSUER_ID";

   const token = jwt.sign(
     {
       iss: issuerId,
       iat: Math.floor(Date.now() / 1000),
       exp: Math.floor(Date.now() / 1000) + 1200, // 20 minutes
       aud: "appstoreconnect-v1",
     },
     privateKey,
     {
       algorithm: "ES256",
       header: {
         alg: "ES256",
         kid: keyId,
         typ: "JWT",
       },
     }
   );
   ```

2. **Find Subscription:**

   - Use App Store Connect API to find subscription by store identifier
   - Endpoint: `GET /v1/subscriptions?filter[referenceName]={storeIdentifier}`

3. **Get or Create Price Schedule:**

   - Get existing price schedule or create new one
   - Endpoint: `POST /v1/subscriptions/{subscriptionId}/priceSchedules`

4. **Set Price:**
   - Create price point for the territory
   - Endpoint: `POST /v1/subscriptionPriceSchedules/{scheduleId}/manualPrices`

## Environment Variables

Add to your backend `.env`:

```
APP_STORE_CONNECT_KEY_ID=your_key_id
APP_STORE_CONNECT_ISSUER_ID=your_issuer_id
APP_STORE_CONNECT_PRIVATE_KEY_PATH=./AuthKey_XXXXXXXXXX.p8
```

## Security Notes

- **NEVER** expose your private key in the frontend
- Always handle JWT generation on the backend
- Store private keys securely (use environment variables or secret management)
- Rotate API keys regularly

## Resources

- [App Store Connect API Documentation](https://developer.apple.com/documentation/appstoreconnectapi)
- [Creating API Keys](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)
- [Managing Subscriptions](https://developer.apple.com/documentation/appstoreconnectapi/subscriptions)
