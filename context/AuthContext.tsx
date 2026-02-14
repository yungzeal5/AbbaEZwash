"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phone_number?: string;
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
  is_email_verified?: boolean;
  custom_id?: string;
  is_online?: boolean;
  streak_count?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  email: string;
  phone_number?: string;
  role?: string;
  location?: {
    address?: string;
  };
  referral_code?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const userData = await apiRequest("/users/profile/");
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // Clear any existing tokens before logging in to prevent stale token issues
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    const data = await apiRequest("/users/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
      requiresAuth: false,
    });

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    const userData = await apiRequest("/users/profile/");
    setUser(userData);

    if (userData.role === "ADMIN" || userData.role === "SUPER_ADMIN") {
      router.push("/admin");
    } else if (userData.role === "RIDER") {
      router.push("/rider");
    } else if (userData.role === "AMBASSADOR") {
      router.push("/ambassador");
    } else {
      router.push("/");
    }
  };

  const register = async (formData: RegisterData) => {
    await apiRequest("/users/register/", {
      method: "POST",
      body: JSON.stringify(formData),
      requiresAuth: false,
    });

    // Auto-login after registration
    await login({
      username: formData.username,
      password: formData.password,
    });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
