import { request } from "./request";

const orderService = {
    getAllOrders: async (params) => {
        return await request("GET", "/v1/orders/product", null, {}, params);
    },
    getOrderById: async (id) => {
        return await request("GET", `/v1/orders/${id}`);
    },
    createShippingOrder: async (data) => {
        return await request("POST", "/v1/orders/shipping", data);
    },
    updateStatus: async (id, data) => {
        return await request("PUT", `/v1/orders/status/${id}`, data);
    },
    cancelOrder: async (id, data) => {    
        return await request("PUT", `/v1/orders/shipping/cancel/${id}`, data);
    },

    shippingWebhook: async (data) => {
        return await request("POST", "/v1/orders/shipping/webhook", data);
    },
};

export default orderService;