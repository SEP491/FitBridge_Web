import { request } from "./request";

export const couponService = {
  createCoupon: (data) => request("POST", "/v1/coupons", data),
  getCoupons: () => request("GET", "/v1/coupons"),
  getCouponById: (id) => request("GET", `/v1/coupons/${id}`),
  updateCoupon: (id, data) => request("PUT", `/v1/coupons/${id}`, data),
  deleteCoupon: (id) => request("DELETE", `/v1/coupons/${id}`),
};
