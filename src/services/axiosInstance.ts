import axios from "axios";

const getBaseUrl = () => {
  // return 'http://localhost:3300';
  return 'https://clothing-shop-be-5eol.onrender.com';
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Use localStorage for token management on web
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const safeData = config.data ? JSON.stringify(config.data) : "no data";
      const safeUrl = config.url || "unknown endpoint";
      console.log(
        `${config.method?.toUpperCase() || "REQUEST"} ${safeUrl}`,
        safeData
      );

      const token = localStorage.getItem("token");
      if (token) {
        if (config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    try {
      const statusText = response.status
        ? `${response.status}`
        : "unknown status";
      console.log(
        `Response from ${response.config.url || "unknown endpoint"}`,
        statusText,
        response.data ? JSON.stringify(response.data) : "no data"
      );
    } catch (error) {
      console.error("Error logging response:", error);
    }
    return response;
  },
  (error) => {
    try {
      console.error(
        "Response error:",
        error.response?.status || "unknown status",
        error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message || "Unknown error"
      );
    } catch (loggingError) {
      console.error("Error while logging error:", loggingError);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
