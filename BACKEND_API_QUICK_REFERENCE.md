# Backend API Quick Reference

## Endpoint Summary

| # | Endpoint | Method | Purpose |
|---|----------|--------|---------|
| 1 | `/api/app-store-connect/configure-credentials` | POST | Store App Store Connect credentials |
| 2 | `/api/app-store-connect/apps` | GET | Get list of apps |
| 3 | `/api/app-store-connect/subscription-groups` | POST | Create subscription group |
| 4 | `/api/app-store-connect/subscriptions` | POST | Create subscription |
| 5 | `/api/app-store-connect/subscriptions/{id}/price-points` | GET | Get price points |
| 6 | `/api/app-store-connect/subscriptions/{id}/price-schedule` | POST | Set subscription price |
| 7 | `/api/revenuecat/products` | POST | Create product |
| 8 | `/api/revenuecat/entitlements` | POST | Create entitlement |
| 9 | `/api/revenuecat/entitlements/{id}/attach-products` | POST | Attach product to entitlement |
| 10 | `/api/revenuecat/offerings` | POST | Create offering |
| 11 | `/api/revenuecat/offerings/{id}/packages` | POST | Create package |
| 12 | `/api/revenuecat/packages/{id}/attach-products` | POST | Attach product to package |

## Request/Response Examples

### 1. Create Subscription Group
```http
POST /api/app-store-connect/subscription-groups
Content-Type: application/json

{
  "app_id": "app123456",
  "reference_name": "Premium Subscriptions"
}
```

### 2. Create Subscription
```http
POST /api/app-store-connect/subscriptions
Content-Type: application/json

{
  "subscription_group_id": "sub_group_123",
  "name": "Premium Monthly",
  "product_id": "com.app.premium.monthly",
  "subscription_period": "ONE_MONTH",
  "family_sharable": false
}
```

### 3. Set Price
```http
POST /api/app-store-connect/subscriptions/sub_123456/price-schedule
Content-Type: application/json

{
  "price_point_id": "price_point_123",
  "territory": "USA",
  "start_date": "2024-01-01"
}
```

### 4. Create RevenueCat Product
```http
POST /api/revenuecat/products
Content-Type: application/json

{
  "store_identifier": "com.app.premium.monthly",
  "app_id": "app_revenuecat_id",
  "type": "subscription",
  "display_name": "Premium Monthly"
}
```

### 5. Create Entitlement
```http
POST /api/revenuecat/entitlements
Content-Type: application/json

{
  "lookup_key": "premium",
  "display_name": "Premium Access"
}
```

### 6. Attach Product to Entitlement
```http
POST /api/revenuecat/entitlements/entl_123456/attach-products
Content-Type: application/json

{
  "product_ids": ["prod_123456"]
}
```

### 7. Create Offering
```http
POST /api/revenuecat/offerings
Content-Type: application/json

{
  "lookup_key": "default",
  "display_name": "Premium Offering"
}
```

### 8. Create Package
```http
POST /api/revenuecat/offerings/offrng_123456/packages
Content-Type: application/json

{
  "lookup_key": "monthly",
  "display_name": "Monthly Package",
  "position": 0
}
```

### 9. Attach Product to Package
```http
POST /api/revenuecat/packages/pkg_123456/attach-products
Content-Type: application/json

{
  "products": [
    {
      "product_id": "prod_123456",
      "eligibility_criteria": "all"
    }
  ]
}
```

## JWT Token Generation

### Node.js
```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    iss: issuerId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 1200,
    aud: 'appstoreconnect-v1'
  },
  privateKey,
  {
    algorithm: 'ES256',
    header: { alg: 'ES256', kid: keyId, typ: 'JWT' }
  }
);
```

### Python
```python
import jwt
import time

token = jwt.encode(
    {
        "iss": issuer_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + 1200,
        "aud": "appstoreconnect-v1"
    },
    private_key,
    algorithm="ES256",
    headers={"alg": "ES256", "kid": key_id, "typ": "JWT"}
)
```

## Error Codes

- `AUTH_ERROR` - Invalid credentials (401)
- `NOT_FOUND` - Resource not found (404)
- `DUPLICATE_ERROR` - Resource exists (409)
- `VALIDATION_ERROR` - Invalid data (400)
- `RATE_LIMIT` - Too many requests (429)
- `SERVER_ERROR` - Internal error (500)

## Base URLs

- **App Store Connect:** `https://api.appstoreconnect.apple.com/v1`
- **RevenueCat:** `https://api.revenuecat.com/v2/projects/{project_id}`

## Required Headers

### App Store Connect
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### RevenueCat
```
Authorization: Bearer {REVENUECAT_API_KEY}
Content-Type: application/json
```

