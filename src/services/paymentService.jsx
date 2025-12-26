import { request } from "./request";

const paymentService = {
    getAllWithdrawalRequests: (params) => request("GET", "/v1/payments/withdrawal-requests", null, {}, params),
    approveWithdrawalRequest: (id, imageUrl) => request("PUT", `/v1/payments/withdrawal-requests/${id}/approve`, { imageUrl }),
    rejectWithdrawalRequest: (id, reason) => request("PUT", `/v1/payments/withdrawal-requests/${id}/reject`, { reason }),
    confirmWithdrawalRequest: (id) => request("PUT", `/v1/payments/withdrawal-requests/${id}/confirm`),
    createWithdrawalRequest: (data) => request("POST", "/v1/payments/request-withdrawal", data),
    checkMaximumWithdrawalAmount: (data) => request("POST", "/v1/payments/check-withdrawal-maximum-amount", data),
};

export default paymentService;
