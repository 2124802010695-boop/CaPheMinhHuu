import axios from "../../../common/utils/axiosCustomize";

export const sendOtpAPI = (email) =>
    axios.post("/customer/send-otp", { email });

export const verifyOtpAPI = (email, code, wantRegister) =>
    axios.post("/customer/verify-otp", { email, code, wantRegister });

export const googleLoginAPI = (idToken) =>
    axios.post("/customer/google-login", { idToken });

export const getProfileAPI = () => axios.get("/customer/profile");
