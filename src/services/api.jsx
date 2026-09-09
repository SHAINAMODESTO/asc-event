import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// REQUEST INTERCEPTOR
// ATTACH ACCESS TOKEN TO EVERY REQUEST
// ========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// HANDLE EXPIRED / INVALID TOKEN
// ========================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("isLoggedIn");

      // Redirect to login
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;