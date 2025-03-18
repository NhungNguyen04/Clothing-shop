import axios from "axios";

const API_BASE_URL = "http://[::1]:3300"; // Thay đổi thành URL API của bạn

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.error("Unauthorized! Redirecting to login...");
      } else if (status === 403) {
        console.error("You don't have permission.");
      } else {
        console.error("Calling error:", error.response.data.message || "Unknown error");
      }
    } else {
      console.error("Network error");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
