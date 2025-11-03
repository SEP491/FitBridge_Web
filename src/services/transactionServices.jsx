import { request } from "./request";

const transactionService = {
  getTransactions: (params) =>
    request("GET", "/v1/transactions/current-user", null, {}, params),

  getTransactionsDetails: (transactionId) =>
    request("GET", `/v1/transactions/${transactionId}`, null),
  
  getAdminTransaction: (params) =>
    request("GET", "/v1/admin/transaction", null, {}, params),

  getGymOwnerTransaction: (params) =>
    request("GET", "/v1/transactions/gym-owner", null, {}, params),
  getGymOwnerTransactionDetails: (transactionId) =>
    request("GET", `/v1/transactions/gym-owner/${transactionId}`, null),
};

export default transactionService;
