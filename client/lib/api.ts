import axios, { AxiosInstance, AxiosError } from "axios";
import Cookies from "js-cookie";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data
    );

    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // Clear any local session data
      Cookies.remove("jwt", { domain: ".localhost" });

      // Redirect to login if not already there
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/signin")
      ) {
        window.location.href =
          "/signin?message=Session expired. Please sign in again.";
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  ownerUsername: string;
  createdAt: string;
}

export interface UserWithShops extends User {
  shops: Shop[];
}

// Auth API functions
export const authApi = {
  async signup(
    username: string,
    password: string,
    shopNames: string[]
  ): Promise<ApiResponse> {
    const response = await api.post("/auth/signup", {
      username,
      password,
      shopNames,
    });
    return response.data;
  },

  async login(
    username: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{
    status: number;
    message: string;
    user: UserWithShops;
    token: string;
    expiresIn: string;
  }> {
    const response = await api.post("/auth/login", {
      username,
      password,
      rememberMe,
    });
    return response.data;
  },

  async logout(): Promise<ApiResponse> {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// Users API functions
export const usersApi = {
  async getCurrentUser(): Promise<ApiResponse<UserWithShops>> {
    const response = await api.get("/users/me");
    return response.data;
  },
};

// Shops API functions
export const shopsApi = {
  async getShopByName(shopName: string): Promise<ApiResponse<Shop>> {
    const response = await api.get(`/shops/by-name/${shopName}`);
    return response.data;
  },

  async getShopById(shopId: string): Promise<ApiResponse<Shop>> {
    const response = await api.get(`/shops/${shopId}`);
    return response.data;
  },
};

// Utility function to handle API errors
export const handleApiError = (error: any): string[] => {
  if (error.response?.data?.message) {
    // Handle NestJS validation errors
    if (Array.isArray(error.response.data.message)) {
      return error.response.data.message;
    }
    return [error.response.data.message];
  }

  if (error.message) {
    return [error.message];
  }

  return ["An unexpected error occurred. Please try again."];
};

// Function to detect if we're on a subdomain
export const getSubdomain = (): string | null => {
  if (typeof window === "undefined") return null;

  const host = window.location.host;
  const parts = host.split(".");

  // For localhost:3000 or shop.localhost:3000
  if (parts.length >= 2 && parts[1] === "localhost") {
    return parts[0] !== "localhost" ? parts[0] : null;
  }

  // For production domains like shop.example.com
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
};

// Function to check if current subdomain is a valid shop
export const checkSubdomainShop = async (): Promise<Shop | null> => {
  const subdomain = getSubdomain();
  if (!subdomain) return null;

  try {
    const response = await shopsApi.getShopByName(subdomain);
    return response.data || null;
  } catch (error) {
    console.log("Subdomain is not a valid shop:", subdomain);
    return null;
  }
};

export default api;
