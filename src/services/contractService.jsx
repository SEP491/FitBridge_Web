import { request } from "./request";

const contractService = {
  // POST /api/v1/contracts - Create new contract
  createContract: (data) => request("POST", "/v1/contracts", data),

  getAllContracts: (params) =>
    request("GET", "/v1/contracts", null, {}, params),

  getContractById: (contractId) =>
    request("GET", "/v1/contracts", null, {}, { contractId }),

  getContractForCustomer: (customerId) =>
    request("GET", "/v1/contracts", null, {}, { customerId }),

  updateContract: (formData) => request("PUT", "/v1/contracts", formData),

  confirmContract: (contractId) =>
    request("PUT", `/v1/contracts/confirm/${contractId}`),
  getCustomersToCreateContract: (params) =>
    request(
      "GET",
      `/v1/accounts/admin/expired-contract-users`,
      null,
      {},
      params
    ),
};

export default contractService;
