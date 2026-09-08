"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../lib/auth";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  setStoredUser,
  clearTokens,
} from "../lib/tokens";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!token && !refreshToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response && response.success && response.data) {
        setUser(response.data);
        setStoredUser(response.data);
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadAuth() {
      const token = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!token && !refreshToken) {
        if (!ignore) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (!ignore) {
          if (response && response.success && response.data) {
            setUser(response.data);
            setStoredUser(response.data);
          } else {
            clearTokens();
            setUser(null);
          }
        }
      } catch {
        if (!ignore) {
          clearTokens();
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadAuth();

    // Listen for global session expiry events triggered by api.js
    const handleSessionExpired = () => {
      setUser(null);
      clearTokens();
    };

    window.addEventListener("autocare:session-expired", handleSessionExpired);
    return () => {
      ignore = true;
      window.removeEventListener("autocare:session-expired", handleSessionExpired);
    };
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { accessToken, refreshToken, user: userData } = res.data;
      setTokens(accessToken, refreshToken);
      setUser(userData);
      setStoredUser(userData);
      return userData;
    }
    throw new Error(res.message || "Login failed");
  };

  // Register
  const register = async ({ name, email, phone, password }) => {
    const res = await authApi.register({ name, email, phone, password });
    if (res.success) {
      // Automatically attempt login right after registration
      try {
        const loginRes = await login(email, password);
        return loginRes;
      } catch {
        return res.data;
      }
    }
    throw new Error(res.message || "Registration failed");
  };

  // Logout
  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.warn("Backend logout notification failed:", err.message);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  // Update Profile
  const updateProfile = async ({ name, phone }) => {
    const res = await authApi.updateProfile({ name, phone });
    if (res.success && res.data) {
      setUser(res.data);
      setStoredUser(res.data);
      return res.data;
    }
    throw new Error(res.message || "Failed to update profile");
  };

  // Change Password
  const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    const res = await authApi.changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return res;
  };

  // Deactivate Account
  const deactivateAccount = async (password) => {
    const res = await authApi.deactivateAccount(password);
    clearTokens();
    setUser(null);
    return res;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deactivateAccount,
    refreshUser: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
