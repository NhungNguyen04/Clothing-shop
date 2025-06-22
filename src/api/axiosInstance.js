import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// For debugging: Log all localStorage keys
const logLocalStorage = () => {
  console.log('Available in localStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`- ${key}: ${localStorage.getItem(key).substring(0, 20)}...`);
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Check both possible token locations with detailed logging
    const userToken = localStorage.getItem("userToken");
    const accessToken = localStorage.getItem("accessToken");
    const authToken = localStorage.getItem("authToken");
    
    const token = userToken || accessToken || authToken;
    
    if (token) {
      // Format the authorization header exactly as expected by NestJS/Passport
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API: Adding bearer token to request headers');
    } else {
      console.log('API: No authentication token found in localStorage');
      logLocalStorage();
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        console.error("API Error: Unauthorized! Token may be invalid or expired.");
        console.log("Response headers:", error.response.headers);
        console.log("Auth header used:", error.config?.headers?.Authorization || 'No auth header');
      }
      
      console.error(`API Error (${status}):`, data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
