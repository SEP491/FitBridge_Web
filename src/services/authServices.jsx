import { request } from "./request";

const authService = {
  login: (loginData) => request("POST", "/identities/login", loginData),
  register: (registerData) => request("POST", "/identities/register-other-accounts", registerData),
  emailConfirm : (email, token) => {
    // Properly encode the token and email for URL
    const encodedToken = encodeURIComponent(token);
    const encodedEmail = encodeURIComponent(email);
    console.log("API Call - Original Token:", token);
    console.log("API Call - Encoded Token:", encodedToken);
    return request("GET", `/identities/confirm-email?token=${encodedToken}&email=${encodedEmail}`);
  },
};

export default authService;
