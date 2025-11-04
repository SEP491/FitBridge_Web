import { request } from "./request";

const adminService = {
  createUserAccount: (data) => request("POST", "/v1/identities/register-customer", data),
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

  banUnbanUser: (data) => request("PUT", `/v1/accounts/ban-unban`, data),

  getAllTransactions: (params) =>
    request("GET", "/v1/transactions", null, {}, params),

  getAllReports: (params) =>
    request("GET", "/v1/reports", null, {}, params),
  updateReportStatus: (reportId,data) => 
    request("PUT", `/v1/reports/${reportId}/status`, data),
};

export default adminService;
