import { request } from "./request";

const blogService = {
  createBlog: (data) => request("POST", "/v1/blogs", data),
  getBlogs: () => request("GET", "/v1/blogs"),
  getBlogById: (id) => request("GET", `/v1/blogs/${id}`),
  updateBlog: (id, data) => request("PUT", `/v1/blogs/${id}`, data),
  deleteBlog: (id) => request("DELETE", `/v1/blogs/${id}`),
  enableBlog: (id) => request("PUT", `/v1/blogs/${id}/enable`),
};

export default blogService;
