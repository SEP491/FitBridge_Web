import { request } from "./request";

const assetsService = {
  getGymAssets: (params) => request("GET", `/v1/gym-assets`, null, {}, params),

  CreateGymAsset: (data) => request("POST", `/v1/gym-assets`, data),

  updateGymAsset: (data) => request("PUT", `/v1/gym-assets`, data),

  deleteGymAsset: (assetId) => request("DELETE", `/v1/gym-assets/${assetId}`),

  getGymAssetsMetadata: (params) =>
    request("GET", `/v1/gym-assets/metadata`, null, {}, params),
};

export default assetsService;
