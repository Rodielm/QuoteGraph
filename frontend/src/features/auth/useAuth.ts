import { useState } from "react";

import { fetchCurrentUser, login as loginRequest, register as registerRequest } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";

export function useAuth() {
  const { token, user, setSession, clearSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      const { access_token } = await loginRequest({ email, password });
      useAuthStore.setState({ token: access_token });
      const currentUser = await fetchCurrentUser();
      setSession(access_token, currentUser);
    } catch {
      setError("Invalid email or password");
      throw new Error("login failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function register(email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      await registerRequest({ email, password });
      await login(email, password);
    } catch {
      setError("Could not register — email may already be in use");
      throw new Error("register failed");
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearSession();
  }

  return {
    token,
    user,
    isAuthenticated: token !== null,
    isLoading,
    error,
    login,
    register,
    logout,
  };
}
