import { request } from "./request";

const addressService = {
    getShopAddresses: async () => {
        return await request("GET", "/v1/addresses/admin/shop-address");
    },
    updateAddressDefault: async (id, data) => {
        return await request("PUT", `/v1/addresses/${id}`, data);
    },
    createShopAddress: async (data) => {
        return await request("POST", "/v1/addresses", data);
    },
};

export default addressService;