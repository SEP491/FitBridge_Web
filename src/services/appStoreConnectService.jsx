import axios from "axios";
import { SignJWT, importPKCS8 } from "jose";

// App Store Connect API configuration
const APP_STORE_CONNECT_API_BASE = "https://api.appstoreconnect.apple.com/v1";

// Get credentials from environment variables or localStorage
const getCredentials = () => {
  const keyId =
    import.meta.env.VITE_APP_STORE_KEY_ID ||
    localStorage.getItem("app_store_key_id");
  const issuerId =
    import.meta.env.VITE_APP_STORE_ISSUER_ID ||
    localStorage.getItem("app_store_issuer_id");
  const privateKey =
    import.meta.env.VITE_APP_STORE_PRIVATE_KEY ||
    localStorage.getItem("app_store_private_key");

  return { keyId, issuerId, privateKey };
};

// Generate JWT token for App Store Connect API
const generateJWT = async () => {
  const { keyId, issuerId, privateKey } = getCredentials();

  if (!keyId || !issuerId || !privateKey) {
    throw new Error(
      "App Store Connect credentials not configured. Please set Key ID, Issuer ID, and Private Key."
    );
  }

  try {
    // Import private key using jose library
    const cryptoKey = await importPKCS8(privateKey, "ES256");

    const now = Math.floor(Date.now() / 1000);

    const jwt = await new SignJWT({
      iss: issuerId,
      iat: now,
      exp: now + 1200, // 20 minutes
      aud: "appstoreconnect-v1",
    })
      .setProtectedHeader({
        alg: "ES256",
        kid: keyId,
        typ: "JWT",
      })
      .sign(cryptoKey);

    return jwt;
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
};

// Create authenticated axios instance
const createAuthenticatedRequest = async (
  method,
  url,
  data = null,
  params = {}
) => {
  const token = await generateJWT();

  const config = {
    method,
    url: `${APP_STORE_CONNECT_API_BASE}${url}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    params,
  };

  if (data && (method === "POST" || method === "PATCH" || method === "PUT")) {
    config.data = data;
  }

  return axios(config);
};

const appStoreConnectService = {
  // Set credentials (store in localStorage)
  setCredentials: (keyId, issuerId, privateKey) => {
    localStorage.setItem("app_store_key_id", keyId);
    localStorage.setItem("app_store_issuer_id", issuerId);
    localStorage.setItem("app_store_private_key", privateKey);
  },

  // Get credentials
  getCredentials: () => getCredentials(),

  // Check if credentials are configured
  hasCredentials: () => {
    const { keyId, issuerId, privateKey } = getCredentials();
    return !!(keyId && issuerId && privateKey);
  },

  // Get apps
  getApps: async (params = {}) => {
    const response = await createAuthenticatedRequest(
      "GET",
      "/apps",
      null,
      params
    );
    return response.data;
  },

  // Get subscription groups for an app
  getSubscriptionGroups: async (appId, params = {}) => {
    const response = await createAuthenticatedRequest(
      "GET",
      `/apps/${appId}/subscriptionGroups`,
      null,
      params
    );
    return response.data;
  },

  // Create subscription group
  createSubscriptionGroup: async (appId, referenceName) => {
    const data = {
      data: {
        type: "subscriptionGroups",
        attributes: {
          referenceName,
        },
        relationships: {
          app: {
            data: {
              type: "apps",
              id: appId,
            },
          },
        },
      },
    };
    const response = await createAuthenticatedRequest(
      "POST",
      `/apps/${appId}/subscriptionGroups`,
      data
    );
    return response.data;
  },

  // Get subscriptions in a group
  getSubscriptions: async (subscriptionGroupId, params = {}) => {
    const response = await createAuthenticatedRequest(
      "GET",
      `/subscriptionGroups/${subscriptionGroupId}/subscriptions`,
      null,
      params
    );
    return response.data;
  },

  // Create subscription
  createSubscription: async (subscriptionGroupId, data) => {
    const payload = {
      data: {
        type: "subscriptions",
        attributes: {
          name: data.name,
          productId: data.productId,
          familySharable: data.familySharable || false,
          subscriptionPeriod: data.subscriptionPeriod || "ONE_MONTH",
          reviewNote: data.reviewNote || "",
        },
        relationships: {
          group: {
            data: {
              type: "subscriptionGroups",
              id: subscriptionGroupId,
            },
          },
        },
      },
    };
    const response = await createAuthenticatedRequest(
      "POST",
      `/subscriptionGroups/${subscriptionGroupId}/subscriptions`,
      payload
    );
    return response.data;
  },

  // Get subscription price points
  getSubscriptionPricePoints: async (subscriptionId, params = {}) => {
    const response = await createAuthenticatedRequest(
      "GET",
      `/subscriptions/${subscriptionId}/pricePoints`,
      null,
      params
    );
    return response.data;
  },

  // Create subscription price schedule
  createSubscriptionPriceSchedule: async (
    subscriptionId,
    pricePointId,
    startDate = null
  ) => {
    const data = {
      data: {
        type: "subscriptionPriceSchedules",
        relationships: {
          subscription: {
            data: {
              type: "subscriptions",
              id: subscriptionId,
            },
          },
          baseTerritory: {
            data: {
              type: "territories",
              id: "USA", // Default to USA
            },
          },
          manualPrices: {
            data: [
              {
                type: "subscriptionPrices",
                id: pricePointId,
              },
            ],
          },
        },
        ...(startDate && {
          attributes: {
            startDate,
          },
        }),
      },
    };
    const response = await createAuthenticatedRequest(
      "POST",
      `/subscriptions/${subscriptionId}/priceSchedules`,
      data
    );
    return response.data;
  },

  // Get subscription prices
  getSubscriptionPrices: async (subscriptionId, params = {}) => {
    const response = await createAuthenticatedRequest(
      "GET",
      `/subscriptions/${subscriptionId}/prices`,
      null,
      params
    );
    return response.data;
  },

  // Get territories
  getTerritories: async (params = {}) => {
    const response = await createAuthenticatedRequest(
      "GET",
      "/territories",
      null,
      params
    );
    return response.data;
  },

  // Get subscription by product ID
  getSubscriptionByProductId: async (productId) => {
    const response = await createAuthenticatedRequest(
      "GET",
      "/subscriptions",
      null,
      {
        "filter[productId]": productId,
      }
    );
    return response.data;
  },
};

export default appStoreConnectService;
