import { request } from "./request";

const dashboardService = {
    getBalanceOfGym: (params) => request("GET", "/v1/dashboard/wallet-balance", null, {}, params),
    getAvailableBalanceDetails: (params) => request("GET", "/v1/dashboard/available-balance-detail", null, {}, params),
    getPendingBalanceDetails: (params) => request("GET", "/v1/dashboard/pending-balance-detail", null, {}, params),
    getDisbursementDetails: (params) => request("GET", "/v1/dashboard/disbursement-detail", null, {}, params),
};

export default dashboardService;