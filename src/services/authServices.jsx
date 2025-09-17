import { request } from "./request";

const authService = {
  login: (loginData) => request("POST", "/identities/login", loginData),
  register: (registerData) => request("POST", "/identities/register-other-accounts", registerData),
  emailConfirm : (email, token) => request("GET", `/identities/confirm-email?token=${token}&email=${email}`),
};

export default authService;
