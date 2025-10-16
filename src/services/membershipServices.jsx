import { request } from "./request";

const membershipService = {
    getAllMemberships: async (params) => {
    return await request("GET","/v1/memberships", params );
  },
  getMembershipById: async (id) => {
    return await request("GET", `/v1/memberships/${id}`);
  },
  createMembership: async (data) => {
    return await request("POST", "/v1/memberships", data);
  },
  updateMembership: async (id, data) => {
    return await request("PUT", `/v1/memberships/${id}`, data);
  },
  deleteMembership: async (id) => {
    return await request("DELETE", `/v1/memberships/${id}`);
  },
};

export default membershipService;
