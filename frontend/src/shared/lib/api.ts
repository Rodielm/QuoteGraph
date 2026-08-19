import axios from "axios";

import { useAuthStore } from "@/features/auth/store";

declare global {
  interface Window {
    __ENV__?: { API_URL?: string };
  }
}

export const api = axios.create({
  baseURL: window.__ENV__?.API_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  paramsSerializer: { indexes: null },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  },
);
