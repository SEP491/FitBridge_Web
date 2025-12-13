import axios from "axios";

// RevenueCat API configuration
// IMPORTANT: In production, these API calls should be proxied through your backend
// to avoid exposing the API key in the frontend
const REVENUECAT_API_BASE = "https://api.revenuecat.com/v2";
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";
const REVENUECAT_PROJECT_ID = import.meta.env.VITE_REVENUECAT_PROJECT_ID || "";

// Create axios instance for RevenueCat
const revenueCatAxios = axios.create({
  baseURL: REVENUECAT_API_BASE,
  headers: {
    Authorization: `Bearer ${REVENUECAT_API_KEY}`,
    "Content-Type": "application/json",
  },
});

const revenueCatService = {
  // Metrics & Overview
  getChartRevenue: (params = {}) =>
    revenueCatAxios.get(`/projects/${REVENUECAT_PROJECT_ID}/metrics/overview`, {
      params,
    }),

  // Customers
  getCustomers: (params = {}) =>
    revenueCatAxios.get(`/projects/${REVENUECAT_PROJECT_ID}/customers`, {
      params,
    }),
  getCustomer: (customerId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}`,
      { params }
    ),
  createCustomer: (data) =>
    revenueCatAxios.post(`/projects/${REVENUECAT_PROJECT_ID}/customers`, data),

  // Customer Subscriptions
  getCustomerSubscriptions: (customerId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/subscriptions`,
      { params }
    ),

  // Customer Active Entitlements
  getCustomerActiveEntitlements: (customerId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/active_entitlements`,
      { params }
    ),

  // Customer Purchases
  getCustomerPurchases: (customerId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/purchases`,
      { params }
    ),

  // Customer Actions
  grantEntitlement: (customerId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/actions/grant_entitlement`,
      data
    ),
  revokeGrantedEntitlement: (customerId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/actions/revoke_granted_entitlement`,
      data
    ),
  transferCustomer: (customerId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/actions/transfer`,
      data
    ),
  assignOffering: (customerId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/customers/${customerId}/actions/assign_offering`,
      data
    ),

  // Subscriptions
  getSubscription: (subscriptionId) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/subscriptions/${subscriptionId}`
    ),
  searchSubscriptions: (params = {}) =>
    revenueCatAxios.get(`/projects/${REVENUECAT_PROJECT_ID}/subscriptions`, {
      params,
    }),
  getSubscriptionEntitlements: (subscriptionId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/subscriptions/${subscriptionId}/entitlements`,
      { params }
    ),
  getSubscriptionTransactions: (subscriptionId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/subscriptions/${subscriptionId}/transactions`,
      { params }
    ),
  cancelSubscription: (subscriptionId, data = {}) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/subscriptions/${subscriptionId}/actions/cancel`,
      data
    ),
  refundSubscription: (subscriptionId, data = {}) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/subscriptions/${subscriptionId}/actions/refund`,
      data
    ),
  refundSubscriptionTransaction: (subscriptionId, transactionId, data = {}) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/subscriptions/${subscriptionId}/transactions/${transactionId}/actions/refund`,
      data
    ),

  // Purchases
  getPurchase: (purchaseId) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/purchases/${purchaseId}`
    ),
  getPurchaseEntitlements: (purchaseId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/purchases/${purchaseId}/entitlements`,
      { params }
    ),
  refundPurchase: (purchaseId, data = {}) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/purchases/${purchaseId}/actions/refund`,
      data
    ),

  // Apps
  getApps: (params = {}) =>
    revenueCatAxios.get(`/projects/${REVENUECAT_PROJECT_ID}/apps`, {
      params,
    }),

  // Products
  getProducts: (params = {}) =>
    revenueCatAxios.get(`/projects/${REVENUECAT_PROJECT_ID}/products`, {
      params,
    }),
  getProduct: (productId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/products/${productId}`,
      { params }
    ),
  createProduct: (data) =>
    revenueCatAxios.post(`/projects/${REVENUECAT_PROJECT_ID}/products`, data),
  pushProductToStore: (productId, data = {}) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/products/${productId}/create_in_store`,
      data
    ),

  // Entitlements
  getEntitlements: (params = {}) =>
    revenueCatAxios.get(`/projects/${REVENUECAT_PROJECT_ID}/entitlements`, {
      params,
    }),
  getEntitlement: (entitlementId) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/entitlements/${entitlementId}`
    ),
  createEntitlement: (data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/entitlements`,
      data
    ),
  getEntitlementProducts: (entitlementId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/entitlements/${entitlementId}/products`,
      { params }
    ),
  attachProductsToEntitlement: (entitlementId, data) => {
    // Convert products array to product_ids array if needed
    const requestData = data.product_ids
      ? data
      : { product_ids: data.products?.map((p) => p.product_id) || [] };
    return revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/entitlements/${entitlementId}/actions/attach_products`,
      requestData
    );
  },
  detachProductsFromEntitlement: (entitlementId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/entitlements/${entitlementId}/actions/detach_products`,
      data
    ),

  // Offerings
  getOfferings: (params = {}) =>
    revenueCatAxios.get(`/projects/${REVENUECAT_PROJECT_ID}/offerings`, {
      params,
    }),
  getOffering: (offeringId) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/offerings/${offeringId}`
    ),
  createOffering: (data) =>
    revenueCatAxios.post(`/projects/${REVENUECAT_PROJECT_ID}/offerings`, data),
  getOfferingPackages: (offeringId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/offerings/${offeringId}/packages`,
      { params }
    ),

  // Packages
  getPackage: (packageId) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/packages/${packageId}`
    ),
  getPackageProducts: (packageId, params = {}) =>
    revenueCatAxios.get(
      `/projects/${REVENUECAT_PROJECT_ID}/packages/${packageId}/products`,
      { params }
    ),
  createPackage: (offeringId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/offerings/${offeringId}/packages`,
      data
    ),
  attachProductsToPackage: (packageId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/packages/${packageId}/actions/attach_products`,
      data
    ),
  detachProductsFromPackage: (packageId, data) =>
    revenueCatAxios.post(
      `/projects/${REVENUECAT_PROJECT_ID}/packages/${packageId}/actions/detach_products`,
      data
    ),
};

export default revenueCatService;
