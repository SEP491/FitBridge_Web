import { request } from "./request";

const systemconfigService = {
  getSystemConfigs: () => request("GET", "/v1/system-configurations"),

  getSystemConfigByKey: (key) =>
    request("GET", `/v1/system-configurations/${key}`),

  updateSystemConfig: (id, data) =>
    request("PUT", `/v1/system-configurations/${id}`, data),

  createSystemConfig: (data) =>
    request("POST", "/v1/system-configurations", data),
};

export default systemconfigService;
