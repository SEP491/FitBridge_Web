import { request } from "./request";

const certificateService = {
  getCertificates: (params) =>
    request("GET", `/v1/certificates`, null, {}, params),

  updateCertificateStatus: (certificateId, data) =>
    request("PUT", `/v1/certificates/${certificateId}`, data),

  deleteCertificate: (certificateId) =>
    request("DELETE", `/v1/certificates/${certificateId}`),
};

export default certificateService;
