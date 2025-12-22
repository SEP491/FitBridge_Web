import { request } from "./request";

const dashboardService = {
    getBalanceOfGym: (params) => request("GET", "/v1/dashboard/balance-of-gym", null, {}, params),
};

export default dashboardService;