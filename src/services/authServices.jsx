import { request } from "./request";

const authService = {
  login: (loginData) => request("POST", "/v1/identities/login", loginData),
  register: (registerData) => request("POST", "/v1/identities/register-other-accounts", registerData),
  emailConfirm : (email, token) => {
    // Properly encode the token and email for URL
    const encodedToken = encodeURIComponent(token);
    const encodedEmail = encodeURIComponent(email);
    console.log("API Call - Original Token:", token);
    console.log("API Call - Encoded Token:", encodedToken);
    return request("GET", `/v1/identities/confirm-email?token=${encodedToken}&email=${encodedEmail}`);
  },
};

export default authService;
