import axios from "axios";
import API_BASE_URL from "../config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("🚨 401 → Auto logout");

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");

      if (!sessionStorage.getItem("logoutReloaded")) {
        sessionStorage.setItem("logoutReloaded", "true");

        window.location.href = "/login";

        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

export default api;