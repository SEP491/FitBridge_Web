import { request } from "./request";

const profileService = {
  getProfile: (params) =>
    request("GET", "/v1/accounts/profile", null, {}, params),
  updateProfile: (userid, data) =>
    request("PUT", `/v1/accounts/update-profile/${userid}`, data),
  uploadCitizenImage: (data) => request("POST", `/v1/uploads`, data),
  updateAvatar: (data) => request("PUT", `/v1/accounts/update-avatar`, data),
};

export default profileService;
