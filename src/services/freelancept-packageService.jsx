import { request } from "./request";

const freelanceptPackageService = {
    createPackage: (data) => request("POST", "/v1/freelance-ptpackages", data),
    getPackages: (params) => request("GET", "/v1/freelance-ptpackages", null, {}, params),
    getPackageById: (id) => request("GET", `/v1/freelance-ptpackages/${id}`),
    updatePackage: (id, data) => request("PUT", `/v1/freelance-ptpackages/${id}`, data),
    deletePackage: (id) => request("DELETE", `/v1/freelance-ptpackages/${id}`),
};
export default freelanceptPackageService;