import { request } from "./request";

const hotResearchService = {
  getSubscriptionPlan: () =>
    request(
      "GET",
      "/v1/subscriptions/plans",
      null,
      {},
      { isGetHotResearchSubscription: true }
    ),
  getUserSubscriptionHistory: (params) =>
    request(
      "GET",
      "/v1/subscriptions/user-subscription/history",
      null,
      {},
      params
    ),

  cancelSubscription: (userSubscriptionId) =>
    request(
      "PUT",
      `/v1/subscriptions/cancel-subscription/${userSubscriptionId}`
    ),

  paySubscription: (data) => request("POST", `/v1/payments/payment-link`, data),

  checkSubscipriontionAvailability: () =>
    request("GET", `/v1/subscriptions/check-hot-research-subscription`),

  editSubscriptionPlan: (data) =>
    request("PUT", `/v1/subscriptions/admin`, data, {
      "Content-Type": "multipart/form-data",
    }),
};

export default hotResearchService;
