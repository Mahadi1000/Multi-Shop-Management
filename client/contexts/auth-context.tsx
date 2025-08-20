"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  api,
  authApi,
  usersApi,
  handleApiError,
  type UserWithShops,
  type User,
} from "@/lib/api";

interface LoginResponse {
  status: number;
  message: string;
  user: UserWithShops;
  token: string;
  expiresIn: string;
}

interface AuthContextType {
  user: UserWithShops | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; errors: string[] }>;
  signup: (
    username: string,
    password: string,
    shopNames: string[]
  ) => Promise<{ success: boolean; errors: string[] }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithShops | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);

  // Function to fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      console.log("🔄 Fetching current user from API...");
      const response = await usersApi.getCurrentUser();
      console.log("🔍 User data response:", response);

      // Handle both ApiResponse<UserWithShops> and direct UserWithShops
      let userData: UserWithShops | null = null;

      if (response) {
        // Check if it's an ApiResponse wrapper
        if ("data" in response && response.data) {
          userData = response.data;
        }
        // Check if it's direct user data
        else if ("id" in response || "username" in response) {
          userData = response as UserWithShops;
        }
      }

      if (userData && (userData.id || userData.username)) {
        setUser(userData);
        setHasValidToken(true); // Ensure token state is consistent
        console.log("✅ User data set successfully:", userData);
        return true;
      } else {
        console.log("⚠️ No user data in response. Response:", response);
        setUser(null);
        setHasValidToken(false);
        return false;
      }
    } catch (error: any) {
      console.log("❌ Failed to fetch user:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers,
      });
      setUser(null);

      // Only clear token if it's a 401 (unauthorized) error
      if (error.response?.status === 401) {
        console.log("🔓 Clearing invalid token due to 401 error");
        setAuthToken(null);
        setHasValidToken(false);
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
        }
      }
      return false;
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔄 Starting authentication check...");
      setIsLoading(true);

      // Check if we have a stored token
      if (typeof window !== "undefined") {
        const isSubdomain =
          window.location.hostname !== "localhost" &&
          window.location.hostname.includes("localhost");
        console.log("🔍 Domain check:", {
          hostname: window.location.hostname,
          isSubdomain,
          href: window.location.href,
        });

        // Try localStorage first (works on main domain)
        let storedToken = localStorage.getItem("authToken");

        // If no token and we're on a subdomain, try multiple methods to get it
        if (!storedToken && isSubdomain) {
          console.log(
            "🔄 No token on subdomain, attempting cross-domain token retrieval..."
          );

          // Method 1: Check URL parameters (if redirected from main domain with token)
          const urlParams = new URLSearchParams(window.location.search);
          const tokenFromUrl = urlParams.get("token");
          if (tokenFromUrl) {
            console.log("🔗 Found token in URL parameters");
            storedToken = tokenFromUrl;
            // Clean up URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          } else {
            // Method 2: Try iframe communication with main domain
            storedToken = await getCrossSubdomainToken();
          }
        }

        if (storedToken) {
          console.log("🚀 Found stored token, setting auth immediately...");
          setAuthToken(storedToken);
          setHasValidToken(true);

          // Store token in current domain's localStorage
          localStorage.setItem("authToken", storedToken);

          // Try to fetch user data to verify token
          const success = await fetchCurrentUser();
          if (!success) {
            console.log("⚠️ Token verification failed");
            setHasValidToken(false);
          } else {
            console.log("✅ Authentication restored from token");
          }
        } else {
          console.log(
            "ℹ️ No stored token found, checking cookie-based auth..."
          );
          // Try cookie-based authentication
          const success = await fetchCurrentUser();
          if (success) {
            console.log("✅ Authenticated via cookie (cross-subdomain)");
            setHasValidToken(true);
          } else {
            console.log("ℹ️ No authentication found");
            setHasValidToken(false);
          }
        }
      }

      setIsLoading(false);
      console.log("🏁 Authentication check completed:", {
        isAuthenticated: !!user || hasValidToken,
        hasUser: !!user,
        hasValidToken,
        hostname:
          typeof window !== "undefined" ? window.location.hostname : "unknown",
      });
    };

    checkAuth();
  }, [fetchCurrentUser]);

  // Login function
  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(username, password, rememberMe);

      // Server now returns { status, message, user (with shops), token, expiresIn } structure
      if (response.user && response.token) {
        console.log("✅ Login response received:", {
          user: response.user,
          tokenExists: !!response.token,
          shopsCount: response.user.shops?.length || 0,
        });

        // Set the token for API requests
        setAuthToken(response.token);

        // Store token in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", response.token);
          console.log(
            "💾 Token saved to localStorage on",
            window.location.hostname
          );
        }

        // Clear any cached API responses to ensure fresh data
        clearApiCache();

        // Save user data directly from login response (includes shops)
        setUser(response.user);
        setHasValidToken(true);
        console.log(
          "✅ Login successful - user data saved, redirecting to dashboard"
        );

        return { success: true, errors: [] };
      } else {
        console.error("❌ Invalid login response structure:", response);
        return { success: false, errors: ["Invalid login response"] };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errors = handleApiError(error);
      return { success: false, errors };
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (
    username: string,
    password: string,
    shopNames: string[]
  ) => {
    try {
      setIsLoading(true);
      await authApi.signup(username, password, shopNames);
      return { success: true, errors: [] };
    } catch (error) {
      const errors = handleApiError(error);
      return { success: false, errors };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user state and token
      setUser(null);
      setAuthToken(null);
      setHasValidToken(false);

      // Remove token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }

      setIsLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user || hasValidToken,
    login,
    signup,
    logout,
    refreshUser,
  };

  // Debug logging for authentication state
  React.useEffect(() => {
    console.log("🔍 Auth State:", {
      hasUser: !!user,
      hasValidToken,
      isAuthenticated: !!user || hasValidToken,
      isLoading,
      username: user?.username,
    });
  }, [user, hasValidToken, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(
      "🔐 Token set for API requests:",
      token.substring(0, 20) + "..."
    );
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("🔓 Token cleared from API requests");
  }
};

const clearApiCache = () => {
  // This is a placeholder. In a real-world scenario, you might want to
  // clear a client-side cache like React Query or Apollo Client.
  console.log("API cache cleared.");
};

// Function to get token from main domain when on subdomain
const getCrossSubdomainToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    console.log("🔗 Attempting iframe communication with main domain...");

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `http://localhost:3001/token-bridge.html`;

    let resolved = false;

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:3001") return;

      if (event.data.type === "TOKEN_RESPONSE" && !resolved) {
        resolved = true;
        console.log(
          "🔗 Received token from main domain:",
          event.data.token ? "Found" : "Not found"
        );
        window.removeEventListener("message", messageHandler);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve(event.data.token);
      }
    };

    window.addEventListener("message", messageHandler);

    iframe.onload = () => {
      console.log("🔗 Token bridge iframe loaded, requesting token...");
      iframe.contentWindow?.postMessage(
        { type: "GET_TOKEN" },
        "http://localhost:3001"
      );
    };

    iframe.onerror = () => {
      console.log("❌ Token bridge iframe failed to load");
      if (!resolved) {
        resolved = true;
        window.removeEventListener("message", messageHandler);
        resolve(null);
      }
    };

    document.body.appendChild(iframe);

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener("message", messageHandler);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        console.log("⏰ Cross-domain token retrieval timeout");
        resolve(null);
      }
    }, 5000);
  });
};
