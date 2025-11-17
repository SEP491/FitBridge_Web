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

  getAllProducts: (params) =>
    request("GET", "/v1/products/admin", null, {}, params),
  createProduct: (data) =>
    request("POST", "/v1/products", data, { "Content-Type": "multipart/form-data" }),
  updateProduct: (productId, data) =>
    request("PUT", `/v1/products/${productId}`, data, { "Content-Type": "multipart/form-data" }),
  deleteProduct: (productId) =>
    request("DELETE", `/v1/products/${productId}`),

    viewProductsDetails: (productId) =>
    request("GET", `/v1/products/admin/${productId}`),
    createProductsDetails: (data) =>
    request("POST", "/v1/product-details", data, { "Content-Type": "multipart/form-data" }),
    updateProductsDetails: (productDetailId, data) =>
    request("PUT", `/v1/product-details/${productDetailId}`, data, { "Content-Type": "multipart/form-data" }),

  getAllBrands: (params) =>
    request("GET", "/v1/brands", null, {}, params),

  // Main Categories
  getAllCategories : (params) =>
    request("GET", "/v1/categories", null, {}, params),
  createCategory: (data) =>
    request("POST", "/v1/categories", data),
  updateCategory: (categoryId, data) =>
    request("PUT", `/v1/categories/${categoryId}`, data),
  deleteCategory: (categoryId) =>
    request("DELETE", `/v1/categories/${categoryId}`),
  
  // Sub Categories
  getAllSubCategories : (params) =>
    request("GET", "/v1/categories/sub-categories", null, {}, params),
  createSubCategory: (data) =>
    request("POST", "/v1/categories/sub-categories", data),
  updateSubCategory: (subCategoryId, data) =>
    request("PUT", `/v1/categories/sub-categories/${subCategoryId}`, data),
  deleteSubCategory: (subCategoryId) =>
    request("DELETE", `/v1/categories/sub-categories/${subCategoryId}`),

  getAllWeights: (params) =>
    request("GET", "/v1/weights", null, {}, params),
  createWeight: (data) =>
    request("POST", "/v1/weights", data),
  updateWeight: (weightId, data) =>
    request("PUT", `/v1/weights/${weightId}`, data),
  deleteWeight: (weightId) =>
    request("DELETE", `/v1/weights/${weightId}`),

  getAllFlavours: (params) =>
    request("GET", "/v1/flavours", null, {}, params),
  createNewFlavour: (data) =>
    request("POST", "/v1/flavours", data),
  updateFlavour: (flavourId, data) =>
    request("PUT", `/v1/flavours/${flavourId}`, data),
  deleteFlavour: (flavourId) =>
    request("DELETE", `/v1/flavours/${flavourId}`),
};

export default adminService;
