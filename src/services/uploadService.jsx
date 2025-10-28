import { request } from "./request";

const uploadService = {
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return await request("POST", "/v1/uploads", formData, {
            'Content-Type': 'multipart/form-data'
        });
    },
};

export default uploadService;
