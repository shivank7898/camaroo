/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosRequestConfig, Method } from "axios"
import { useAuthStore } from "@store/authStore"

// Create an Axios instance
export const api = axios.create({
  headers: {
    "Content-Type": "application/json"
  }
})

// Add an interceptor to log requests and handle FormData
api.interceptors.request.use(
  (config) => {
    console.log(`\n📤 [${config.method?.toUpperCase()}] ${config.url}`);
    if (config.data) {
      console.log("   Payload:", JSON.stringify(config.data, null, 2));
    }
    if (config.data instanceof FormData) {
      delete config.headers?.["Content-Type"]
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add an interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`\n📥 [${response.status}] ${response.config.url}`);
    console.log("   Response:", JSON.stringify(response.data, null, 2));
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(`\n❌ [${error.response.status}] ${error.response.config?.url}`);
      console.log("   Error:", JSON.stringify(error.response.data, null, 2));
    }
    return Promise.reject(error);
  }
)

// Function to dynamically set the base URL
export const setBaseUrl = (baseUrl: string) => {
  api.defaults.baseURL = baseUrl;
}

export const handleLogout = async (logoutAction?: () => void) => {
  const { logout } = useAuthStore.getState();
  logout();
  if (logoutAction) logoutAction();
}

// Define request function types
interface ApiRequestConfig<T> {
  url: string
  method?: Method
  payload?: any
  baseUrl?: string
  responseType?: "json" | "arraybuffer" | "blob" | "text"
}

// Main API request function
export const apiRequest = async <T extends object>({
  url,
  method = "GET",
  payload = null,
  baseUrl,
  responseType
}: ApiRequestConfig<T>): Promise<T | null> => {
  try {
    const token = useAuthStore.getState().token;

    // Use environment variable as primary, or fallback to an args-passed base URL
    const finalBaseUrl = baseUrl || process.env.EXPO_PUBLIC_BASE_URL || "http://35.175.183.49:5000/api/v1";

    // Set base URL if provided
    if (finalBaseUrl) setBaseUrl(finalBaseUrl);

    // Configure request headers
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    // Create Axios configuration object
    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      ...(payload && { data: payload }),
      ...(responseType && { responseType })
    };

    const response = await api.request<T>(config);

    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 401) {
      handleLogout();
    } 

    if (error.response?.data) {
      const serverMessage = error.response.data.message || error.response.data.error || "An API error occurred";
      throw new Error(serverMessage);
    }

    throw error;
  }
}
