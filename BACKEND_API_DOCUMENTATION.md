# Backend API Documentation: Complete Subscription Creation Flow

## Overview

This document details the backend endpoints required to support the complete subscription creation flow that combines **Apple App Store Connect API** and **RevenueCat API**. The frontend will call these endpoints sequentially to create a subscription membership from start to finish.

## Architecture

```
Frontend → Backend Endpoints → Apple App Store Connect API
                              → RevenueCat API
```

The backend handles:

- JWT token generation for App Store Connect API
- Secure credential management
- API orchestration between Apple and RevenueCat
- Error handling and retry logic

---

## Required Environment Variables

```env
# App Store Connect API
APP_STORE_KEY_ID=your_key_id
APP_STORE_ISSUER_ID=your_issuer_id
APP_STORE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# RevenueCat API
REVENUECAT_API_KEY=your_revenuecat_api_key
REVENUECAT_PROJECT_ID=your_project_id
```

---

## Complete Flow Sequence

```
1. Configure Credentials (Optional - can be done once)
   ↓
2. Create Subscription Group in App Store Connect
   ↓
3. Create Subscription in App Store Connect
   ↓
4. Set Price for Subscription in App Store Connect
   ↓
5. Create Product in RevenueCat
   ↓
6. Create Entitlement in RevenueCat
   ↓
7. Attach Product to Entitlement
   ↓
8. Create Offering in RevenueCat
   ↓
9. Create Package in RevenueCat
   ↓
10. Attach Product to Package
```

---

## API Endpoints

### 1. Configure App Store Connect Credentials

**Endpoint:** `POST /api/app-store-connect/configure-credentials`

**Description:** Store App Store Connect API credentials securely on the backend.

**Request Body:**

```json
{
  "key_id": "ABC123DEFG",
  "issuer_id": "12345678-1234-1234-1234-123456789012",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Credentials configured successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Invalid private key format"
}
```

**Implementation Notes:**

- Store credentials securely (encrypted database, environment variables, or secret management service)
- Validate private key format
- Test credentials by making a test API call

---

### 2. Get App Store Apps

**Endpoint:** `GET /api/app-store-connect/apps`

**Description:** Fetch list of apps from App Store Connect.

**Request Headers:**

```
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "app123456",
      "type": "apps",
      "attributes": {
        "name": "My App",
        "bundleId": "com.example.app",
        "sku": "APP_SKU"
      }
    }
  ]
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_ERROR"
}
```

**Implementation Notes:**

- Generate JWT token using stored credentials
- Call: `GET https://api.appstoreconnect.apple.com/v1/apps`
- Handle 401 errors (invalid credentials)

---

### 3. Create Subscription Group

**Endpoint:** `POST /api/app-store-connect/subscription-groups`

**Description:** Create a new subscription group in App Store Connect.

**Request Body:**

```json
{
  "app_id": "app123456",
  "reference_name": "Premium Subscriptions"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sub_group_123",
    "type": "subscriptionGroups",
    "attributes": {
      "referenceName": "Premium Subscriptions"
    },
    "relationships": {
      "app": {
        "data": {
          "id": "app123456",
          "type": "apps"
        }
      }
    }
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Subscription group already exists",
  "code": "DUPLICATE_ERROR",
  "details": {
    "existing_group_id": "sub_group_123"
  }
}
```

**Implementation Notes:**

- Call: `POST https://api.appstoreconnect.apple.com/v1/apps/{app_id}/subscriptionGroups`
- Request body structure:
  ```json
  {
    "data": {
      "type": "subscriptionGroups",
      "attributes": {
        "referenceName": "Premium Subscriptions"
      },
      "relationships": {
        "app": {
          "data": {
            "type": "apps",
            "id": "app_id"
          }
        }
      }
    }
  }
  ```

---

### 4. Create Subscription

**Endpoint:** `POST /api/app-store-connect/subscriptions`

**Description:** Create a new subscription within a subscription group.

**Request Body:**

```json
{
  "subscription_group_id": "sub_group_123",
  "name": "Premium Monthly",
  "product_id": "com.app.premium.monthly",
  "subscription_period": "ONE_MONTH",
  "family_sharable": false,
  "review_note": "Premium subscription with full access"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "sub_123456",
    "type": "subscriptions",
    "attributes": {
      "name": "Premium Monthly",
      "productId": "com.app.premium.monthly",
      "subscriptionPeriod": "ONE_MONTH",
      "familySharable": false
    }
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Product ID already exists",
  "code": "DUPLICATE_PRODUCT_ID"
}
```

**Implementation Notes:**

- Call: `POST https://api.appstoreconnect.apple.com/v1/subscriptionGroups/{subscription_group_id}/subscriptions`
- Valid subscription periods: `ONE_WEEK`, `ONE_MONTH`, `TWO_MONTHS`, `THREE_MONTHS`, `SIX_MONTHS`, `ONE_YEAR`
- Product ID must be unique across all subscriptions

---

### 5. Get Subscription Price Points

**Endpoint:** `GET /api/app-store-connect/subscriptions/{subscription_id}/price-points`

**Description:** Get available price points for a subscription.

**Path Parameters:**

- `subscription_id`: The subscription ID from App Store Connect

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "price_point_123",
      "type": "subscriptionPricePoints",
      "attributes": {
        "customerPrice": {
          "amount": "9.99",
          "currency": "USD"
        },
        "proceeds": {
          "amount": "7.00",
          "currency": "USD"
        }
      }
    }
  ]
}
```

**Implementation Notes:**

- Call: `GET https://api.appstoreconnect.apple.com/v1/subscriptions/{subscription_id}/pricePoints`
- Price points are managed by Apple and depend on subscription period
- Filter by territory if needed: `?filter[territory]=USA`

---

### 6. Create Subscription Price Schedule

**Endpoint:** `POST /api/app-store-connect/subscriptions/{subscription_id}/price-schedule`

**Description:** Set the price for a subscription by creating a price schedule.

**Path Parameters:**

- `subscription_id`: The subscription ID from App Store Connect

**Request Body:**

```json
{
  "price_point_id": "price_point_123",
  "territory": "USA",
  "start_date": "2024-01-01"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "price_schedule_123",
    "type": "subscriptionPriceSchedules",
    "attributes": {
      "startDate": "2024-01-01"
    }
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Price point not found",
  "code": "INVALID_PRICE_POINT"
}
```

**Implementation Notes:**

- Call: `POST https://api.appstoreconnect.apple.com/v1/subscriptions/{subscription_id}/priceSchedules`
- Request body structure:
  ```json
  {
    "data": {
      "type": "subscriptionPriceSchedules",
      "relationships": {
        "subscription": {
          "data": {
            "type": "subscriptions",
            "id": "subscription_id"
          }
        },
        "baseTerritory": {
          "data": {
            "type": "territories",
            "id": "USA"
          }
        },
        "manualPrices": {
          "data": [
            {
              "type": "subscriptionPrices",
              "id": "price_point_id"
            }
          ]
        }
      },
      "attributes": {
        "startDate": "2024-01-01"
      }
    }
  }
  ```

---

### 7. Create Product in RevenueCat

**Endpoint:** `POST /api/revenuecat/products`

**Description:** Create a product in RevenueCat that links to the App Store subscription.

**Request Body:**

```json
{
  "store_identifier": "com.app.premium.monthly",
  "app_id": "app_revenuecat_id",
  "type": "subscription",
  "display_name": "Premium Monthly"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "prod_123456",
    "store_identifier": "com.app.premium.monthly",
    "display_name": "Premium Monthly",
    "type": "subscription"
  }
}
```

**Implementation Notes:**

- Call: `POST https://api.revenuecat.com/v2/projects/{project_id}/products`
- Headers: `Authorization: Bearer {REVENUECAT_API_KEY}`
- The `store_identifier` should match the `product_id` from App Store Connect

---

### 8. Create Entitlement in RevenueCat

**Endpoint:** `POST /api/revenuecat/entitlements`

**Description:** Create an entitlement in RevenueCat.

**Request Body:**

```json
{
  "lookup_key": "premium",
  "display_name": "Premium Access"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "entl_123456",
    "lookup_key": "premium",
    "display_name": "Premium Access"
  }
}
```

**Implementation Notes:**

- Call: `POST https://api.revenuecat.com/v2/projects/{project_id}/entitlements`
- Lookup key must be unique

---

### 9. Attach Product to Entitlement

**Endpoint:** `POST /api/revenuecat/entitlements/{entitlement_id}/attach-products`

**Description:** Link a product to an entitlement.

**Path Parameters:**

- `entitlement_id`: The entitlement ID from RevenueCat

**Request Body:**

```json
{
  "product_ids": ["prod_123456"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Products attached successfully"
}
```

**Implementation Notes:**

- Call: `POST https://api.revenuecat.com/v2/projects/{project_id}/entitlements/{entitlement_id}/actions/attach_products`
- `product_ids` must be an array of strings

---

### 10. Create Offering in RevenueCat

**Endpoint:** `POST /api/revenuecat/offerings`

**Description:** Create an offering in RevenueCat to group packages.

**Request Body:**

```json
{
  "lookup_key": "default",
  "display_name": "Premium Offering"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "offrng_123456",
    "lookup_key": "default",
    "display_name": "Premium Offering"
  }
}
```

**Implementation Notes:**

- Call: `POST https://api.revenuecat.com/v2/projects/{project_id}/offerings`
- Lookup key "default" is special and will be the default offering

---

### 11. Create Package in RevenueCat

**Endpoint:** `POST /api/revenuecat/offerings/{offering_id}/packages`

**Description:** Create a package within an offering.

**Path Parameters:**

- `offering_id`: The offering ID from RevenueCat

**Request Body:**

```json
{
  "lookup_key": "monthly",
  "display_name": "Monthly Package",
  "position": 0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "pkg_123456",
    "lookup_key": "monthly",
    "display_name": "Monthly Package",
    "position": 0
  }
}
```

**Implementation Notes:**

- Call: `POST https://api.revenuecat.com/v2/projects/{project_id}/offerings/{offering_id}/packages`
- Position determines display order (lower numbers appear first)

---

### 12. Attach Product to Package

**Endpoint:** `POST /api/revenuecat/packages/{package_id}/attach-products`

**Description:** Link a product to a package with eligibility criteria.

**Path Parameters:**

- `package_id`: The package ID from RevenueCat

**Request Body:**

```json
{
  "products": [
    {
      "product_id": "prod_123456",
      "eligibility_criteria": "all"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Products attached to package successfully"
}
```

**Implementation Notes:**

- Call: `POST https://api.revenuecat.com/v2/projects/{project_id}/packages/{package_id}/actions/attach_products`
- Valid eligibility criteria: `all`, `google_sdk_lt_6`, `google_sdk_ge_6`

---

## Complete Flow Endpoint (Optional)

**Endpoint:** `POST /api/subscriptions/create-complete`

**Description:** Execute the complete flow in a single request (for advanced use cases).

**Request Body:**

```json
{
  "app_store_connect": {
    "app_id": "app123456",
    "subscription_group_name": "Premium Subscriptions",
    "subscription": {
      "name": "Premium Monthly",
      "product_id": "com.app.premium.monthly",
      "subscription_period": "ONE_MONTH",
      "family_sharable": false
    },
    "price": {
      "price_point_id": "price_point_123",
      "territory": "USA"
    }
  },
  "revenuecat": {
    "app_id": "app_revenuecat_id",
    "product": {
      "display_name": "Premium Monthly"
    },
    "entitlement": {
      "lookup_key": "premium",
      "display_name": "Premium Access"
    },
    "offering": {
      "lookup_key": "default",
      "display_name": "Premium Offering"
    },
    "package": {
      "lookup_key": "monthly",
      "display_name": "Monthly Package",
      "position": 0
    },
    "eligibility_criteria": "all"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "app_store_connect": {
      "subscription_group_id": "sub_group_123",
      "subscription_id": "sub_123456",
      "price_schedule_id": "price_schedule_123"
    },
    "revenuecat": {
      "product_id": "prod_123456",
      "entitlement_id": "entl_123456",
      "offering_id": "offrng_123456",
      "package_id": "pkg_123456"
    }
  }
}
```

**Implementation Notes:**

- Execute all steps sequentially
- Return partial results if any step fails
- Include error details for failed steps

---

## JWT Token Generation for App Store Connect

### Implementation Example (Node.js)

```javascript
const jwt = require("jsonwebtoken");
const fs = require("fs");

function generateAppStoreConnectJWT(keyId, issuerId, privateKey) {
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      iss: issuerId,
      iat: now,
      exp: now + 1200, // 20 minutes
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

  return token;
}

// Usage
const privateKey = process.env.APP_STORE_PRIVATE_KEY;
const keyId = process.env.APP_STORE_KEY_ID;
const issuerId = process.env.APP_STORE_ISSUER_ID;

const token = generateAppStoreConnectJWT(keyId, issuerId, privateKey);
```

### Implementation Example (Python)

```python
import jwt
import time
from datetime import datetime, timedelta

def generate_app_store_connect_jwt(key_id, issuer_id, private_key):
    now = int(time.time())

    headers = {
        "alg": "ES256",
        "kid": key_id,
        "typ": "JWT"
    }

    payload = {
        "iss": issuer_id,
        "iat": now,
        "exp": now + 1200,  # 20 minutes
        "aud": "appstoreconnect-v1"
    }

    token = jwt.encode(
        payload,
        private_key,
        algorithm="ES256",
        headers=headers
    )

    return token
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional error details"
  }
}
```

### Common Error Codes

| Code               | Description                           | HTTP Status |
| ------------------ | ------------------------------------- | ----------- |
| `AUTH_ERROR`       | Invalid App Store Connect credentials | 401         |
| `NOT_FOUND`        | Resource not found                    | 404         |
| `DUPLICATE_ERROR`  | Resource already exists               | 409         |
| `VALIDATION_ERROR` | Invalid request data                  | 400         |
| `RATE_LIMIT`       | Too many requests                     | 429         |
| `SERVER_ERROR`     | Internal server error                 | 500         |

---

## Rate Limiting

### App Store Connect API

- 1000 requests per hour per API key
- Implement exponential backoff for rate limit errors

### RevenueCat API

- Varies by plan
- Check response headers: `RevenueCat-Rate-Limit-Current-Usage`

---

## Testing

### Test Flow Checklist

1. ✅ Configure credentials
2. ✅ Fetch apps list
3. ✅ Create subscription group
4. ✅ Create subscription
5. ✅ Fetch price points
6. ✅ Create price schedule
7. ✅ Create RevenueCat product
8. ✅ Create RevenueCat entitlement
9. ✅ Attach product to entitlement
10. ✅ Create RevenueCat offering
11. ✅ Create RevenueCat package
12. ✅ Attach product to package

### Sandbox Testing

- Use App Store Connect sandbox environment for testing
- Test with sandbox user accounts
- Verify subscriptions appear in App Store Connect dashboard

---

## Security Best Practices

1. **Never expose credentials in frontend**

   - All App Store Connect API calls must go through backend
   - Store credentials securely (encrypted, environment variables)

2. **Validate all inputs**

   - Sanitize product IDs, names, etc.
   - Validate subscription periods

3. **Implement retry logic**

   - Handle transient errors
   - Exponential backoff for rate limits

4. **Log all API calls**

   - For debugging and audit trails
   - Don't log sensitive data

5. **Use HTTPS**
   - All endpoints must use HTTPS
   - Validate SSL certificates

---

## Frontend Integration

The frontend will call these endpoints sequentially:

```javascript
// Example frontend flow
async function createCompleteSubscription(data) {
  // Step 1: Create subscription group
  const group = await fetch('/api/app-store-connect/subscription-groups', {
    method: 'POST',
    body: JSON.stringify({ app_id: data.app_id, reference_name: data.group_name })
  });

  // Step 2: Create subscription
  const subscription = await fetch('/api/app-store-connect/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ subscription_group_id: group.id, ...data.subscription })
  });

  // Step 3: Set price
  await fetch(`/api/app-store-connect/subscriptions/${subscription.id}/price-schedule`, {
    method: 'POST',
    body: JSON.stringify({ price_point_id: data.price_point_id })
  });

  // Step 4: Create RevenueCat product
  const product = await fetch('/api/revenuecat/products', {
    method: 'POST',
    body: JSON.stringify({ store_identifier: subscription.product_id, ... })
  });

  // ... continue with remaining steps
}
```

---

## Support and Resources

- [App Store Connect API Documentation](https://developer.apple.com/documentation/appstoreconnectapi)
- [RevenueCat API Documentation](https://docs.revenuecat.com/reference)
- [JWT.io](https://jwt.io/) - For JWT token debugging

---

## Version History

- **v1.0** (2024-01-XX): Initial documentation
  - Complete flow documentation
  - All endpoint specifications
  - Error handling guidelines
