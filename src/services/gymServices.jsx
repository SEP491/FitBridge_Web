import { request } from "./request";

const gymService = {
  registerGymPT: (data) => request("POST", "/v1/identities/register-gym-pt", data),
  getPTofGym: (params) => {
    const { gymId, ...otherParams } = params;
    return request("GET", `/v1/gyms/${gymId}/pts`, null, {}, otherParams);
  },
  deletePT: (id) => request("DELETE", `/v1/pt/${id}`),

  getCourseOfGym: (params) => {
    const { gymId, ...otherParams } = params;
    return request("GET", `/v1/gym-courses/${gymId}`, null, {}, otherParams);
  },
  addCourse: (data) => request("POST", "/v1/gym-courses", data),

  getSlotOfGym: (params) => request("GET", "/v1/gym-slots", null, {}, params),
  addSlot: (data) => request("POST", "/v1/gym-slots", data),
  deleteSlot: (id) => request("DELETE", `/v1/gym-slots/${id}`),
  deactivateSlot: (id) => request("POST", `/v1/gym-slots/deactivated-slots`, id),
  updateSlot: (data) => request("PUT", `/v1/gym-slots`, data),

  addPTToCourse: (data) => request("POST", "/v1/course-pt", data),
  getPTOfCourse: (id) => request("GET", `/v1/course/${id}/pts`, null, {}),

  getRevenueOfGym: (params) =>
    request("GET", "/v1/gym/me/dashboard", null, {}, params),
};

export default gymService;
