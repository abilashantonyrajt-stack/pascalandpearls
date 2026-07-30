"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  name: string;
  email: string;
  password?: string;
  accountType?: "otp" | "password" | "guest";
}

interface AuthContextValue {
  user: User | null;
  login: (name: string, email: string) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pnp_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  const login = (name: string, email: string) => {
    const u: User = { name, email, accountType: "otp" };
    setUser(u);
    localStorage.setItem("pnp_user", JSON.stringify(u));
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const u: User = { name, email, accountType: "password" };
    setUser(u);
    localStorage.setItem("pnp_user", JSON.stringify(u));
  };

  const loginWithPassword = async (email: string, password: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    const u: User = { name: data.name, email, accountType: "password" };
    setUser(u);
    localStorage.setItem("pnp_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pnp_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithPassword, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
