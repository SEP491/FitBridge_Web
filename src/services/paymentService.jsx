import { request } from "./request";

const paymentService = {
    getAllWithdrawalRequests: (params) => request("GET", "/v1/payments/withdrawal-requests", null, {}, params),
    confirmWithdrawalRequest: (id, imageUrl) => request("PUT", `/v1/payments/withdrawal-requests/${id}/confirm`, { imageUrl }),
    rejectWithdrawalRequest: (id, reason) => request("PUT", `/v1/payments/withdrawal-requests/${id}/reject`, { reason }),
};

export default paymentService;
