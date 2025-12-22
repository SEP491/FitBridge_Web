import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import Cookies from "js-cookie";
const request = async (method, url, data = null, headers = {}, params = {}) => {
  try {
    const accessToken = Cookies.get("accessToken");
    // const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ5b3VyLWFwaS1jbGllbnRzIiwiaXNzIjoieW91ci1hcHBsaWNhdGlvbi1uYW1lIiwiZXhwIjoxNzY2OTk0MTY4LCJzdWIiOiIwMTliMDdlMS0wZDgwLTc3Y2YtOWM4OC0yNjZhN2ZmMGM2MzMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJkaWFuYS5yaWRlcjY5QGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJEaWFuYSBUcnVtcCIsIkF2YXRhclVybCI6Imh0dHBzOi8vY2xvdWQuYXBwd3JpdGUuaW8vdjEvc3RvcmFnZS9idWNrZXRzLzY4ZWQwZmY0MDAxMDY5ZjdhMTBmL2ZpbGVzL2NlNDEwOTUwLTAyOGQtNGE4My1hZTVjLWFjY2MzZWQxZDRkMi92aWV3P3Byb2plY3Q9NjhlZDBmZGQwMDM3MjUzMDMxYjgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJGcmVlbGFuY2VQVCIsImlhdCI6MTc2NjM5NDIyOCwibmJmIjoxNzY2Mzk0MjI4fQ.T_HJN-ZeiPAx_bEZuye2ntUORQcrJDOLcUr0NxeV5Fw"
    console.log(accessToken);
    const authHeaders = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      headers: {
        ...headers,
        ...authHeaders,
      },
      params,
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export { request };
