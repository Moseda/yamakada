const apiUrl = import.meta.env.VITE_API_URL;

// File: frontend\src\utils\api.ts
import axios from "axios";

const BASE_URL = `${apiUrl}`;

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("imarondwq");
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt token refresh if:
    // 1. We get a 401 error
    // 2. We haven't tried to refresh before (prevent infinite loops)
    // 3. We actually have a refresh token stored
    // more complicated than excpected more requests=be careful that token are properly passes/ removed
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${BASE_URL}/refresh-token`, {
          refreshToken,
        });
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // Logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
