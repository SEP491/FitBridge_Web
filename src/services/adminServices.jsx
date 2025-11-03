import { request } from "./request";

const adminService = {
  getAllGym: (params) => request("GET", "/v1/gyms", null, {}, params),
  addGym: (data) =>
    request("POST", "/v1/gym", data, { "Content-Type": "multipart/form-data" }),
  getAllPT: (params) => request("GET", "/v1/admin/get-pt", null, {}, params),
  createPremiumPackage: (data) => request("POST", "/v1/premium", data),
  getAllPremiumSubscriptions: (params) =>
    request("GET", "/v1/premium", null, {}, params),

  getRevenueData: (params) =>
    request("GET", "/v1/dashboard/profit", null, {}, params),

  getAllCustomers: (params) =>
    request("GET", "/v1/accounts/admin/customers", null, {}, params),

  getAllGymPTs: (params) =>
    request("GET", "/v1/accounts/admin/gym-pts", null, {}, params),
  getAllFreelancePTs: (params) =>
    request("GET", "/v1/accounts/freelance-pts", null, {}, params),
  
  getAllGymOwners: (params) =>
    request("GET", "/v1/accounts/admin/gym-owners", null, {}, params),
  
  banUser: (id) => request("PUT", `/v1/user/${id}/ban`),

  deleteUser: (id) => request("DELETE", `/v1/user/${id}`),

  getAllTransactions: (params) =>
    request("GET", "/v1/transactions", null, {}, params),
};

export default adminService;
