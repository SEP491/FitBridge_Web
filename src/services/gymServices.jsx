import { request } from "./request";

const gymService = {
  registerGymPT: (data) =>
    request("POST", "/v1/identities/register-gym-pt", data),
  getPTofGym: (params) => {
    const { gymId, ...otherParams } = params;
    return request("GET", `/v1/gyms/${gymId}/pts`, null, {}, otherParams);
  },
  deletePT: (body) => request("DELETE", `/v1/accounts/delete`, body),
  updatePT: (id, data) => request("PUT", `/v1/accounts/${id}`, data),

  getCourseOfGym: (params) => {
    const { gymId, ...otherParams } = params;
    return request("GET", `/v1/gym-courses/${gymId}`, null, {}, otherParams);
  },

  getSlotOfGym: (params) => request("GET", "/v1/gym-slots", null, {}, params),
  addSlot: (data) => request("POST", "/v1/gym-slots", data),
  deleteSlot: (id) => request("DELETE", `/v1/gym-slots/${id}`),
  deactivateSlot: (id) =>
    request("POST", `/v1/gym-slots/deactivated-slots`, id),
  updateSlot: (data) => request("PUT", `/v1/gym-slots`, data),

  addPTToCourse: (data) =>
    request("POST", "/v1/gym-courses/assign-pt-to-course", data),
  getPTOfCourse: (id) => request("GET", `/v1/gym-courses/${id}/pts`, null, {}),

  getCustomersOfGym: (params) =>
    request("GET", "/v1/gyms/owner/customers", null, {}, params),

  addCourse: (data) => request("POST", "/v1/gym-courses", data),
  updateCourse: (courseId, data) =>
    request("PUT", `/v1/gym-courses/${courseId}`, data),
  deleteCourse: (id) => request("DELETE", `/v1/gym-courses/${id}`),

  getGymPTBookings: (params) =>
    request("GET", "/v1/accounts/gym-owner/gym-pt-bookings", null, {}, params),
  getGymPTRegisterSlots: (params) =>
    request("GET", "/v1/accounts/gym-owner/gym-pt-register-slots", null, {}, params),
};

export default gymService;
