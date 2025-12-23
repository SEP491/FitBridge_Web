import { request } from "./request";

const reportService = {
  processReport: (reportId) =>
    request("POST", `/v1/reports/${reportId}/process`),
  confirmReport: (reportId, data) =>
    request("POST", `/v1/reports/${reportId}/confirm`, data),
  resolveReport: (reportId, data) =>
    request("POST", `/v1/reports/${reportId}/resolve`, data),
  uploadRefundProofReport: (formData) =>
    request("POST", `/v1/reports/upload-refund-proof`, formData, {
      "Content-Type": "multipart/form-data",
    }),
  checkCompletion: (orderItemId) =>
    request("GET", `/v1/orders/course/completion-check/${orderItemId}`),
};

export default reportService;
