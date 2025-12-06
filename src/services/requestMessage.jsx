import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_MESSAGE_API_URL;
import Cookies from "js-cookie";
const requestMessage = async (
  method,
  url,
  data = null,
  headers = {},
  params = {}
) => {
  try {
    const accessToken = Cookies.get("accessToken");
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

export { requestMessage };
