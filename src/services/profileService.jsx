import { request } from "./request";

const profileService = {
  getProfile: (params) =>
    request("GET", "/v1/accounts/profile", null, {}, params),
  updateProfile: (data) =>
    request(
      "PUT",
      `/v1/accounts/update-profile`,
      data,
      data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
    ),
  uploadCitizenImage: (data) => request("POST", `/v1/uploads`, data),
  updateAvatar: (data) => request("PUT", `/v1/accounts/update-avatar`, data),
};

export default profileService;
