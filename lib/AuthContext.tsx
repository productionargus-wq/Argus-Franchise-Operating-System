"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession, Organization } from "./types";

interface AuthContextType {
  currentUser: UserSession;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setCurrentUser: (user: UserSession) => void;
  setOrganization: (org: Organization | null) => void;
  switchRole: (userId: string) => void;
  availableUsers: UserSession[];
  registerNewUser: (user: UserSession) => void;
  loginWithGoogle: (
    email: string,
    name?: string,
    avatar?: string
  ) => Promise<{ success: boolean; error?: string; code?: string; redirectUrl?: string }>;
  registerWithGoogle: (
    companyName: string,
    gstin: string,
    email: string,
    name?: string,
    avatar?: string
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: (reason?: any) => void;
  isSuperAdmin: boolean;
  isHeadOffice: boolean;
  canApprovePrice: boolean;
  canEditPriceMaster: boolean;
}

const GUEST_USER: UserSession = {
  id: "guest",
  name: "Not Signed In",
  email: "",
  role: "franchise_sales",
  orgId: null,
  orgName: null,
  franchiseId: null,
  status: "disabled",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession>(GUEST_USER);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableUsers, setAvailableUsers] = useState<UserSession[]>([]);

  const logout = (reason?: any) => {
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
    setOrganization(null);
    localStorage.removeItem("argus_auth_session");
    localStorage.removeItem("argus_current_user_id");
    if (typeof window !== "undefined") {
      const reasonStr = typeof reason === "string" ? reason : undefined;
      if (reasonStr) {
        window.location.href = `/login?error=${encodeURIComponent(reasonStr)}`;
      } else {
        window.location.href = "/login";
      }
    }
  };

  const verifySession = async (email: string, orgId?: string | null): Promise<boolean> => {
    if (!email) return false;
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orgId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.warn("[Auth] Session invalidated by server:", data);
        logout(data.code === "ACCOUNT_DISABLED" ? "account_disabled" : "account_deleted");
        return false;
      }

      const data = await res.json();
      if (!data.valid) {
        console.warn("[Auth] Session validation failed:", data);
        logout(data.code === "ACCOUNT_DISABLED" ? "account_disabled" : "account_deleted");
        return false;
      }

      return true;
    } catch (err) {
      console.warn("[Auth] Session verification network hiccup:", err);
      return true; // Keep local session during temporary network disconnect
    }
  };

  useEffect(() => {
    try {
      // Restore Live Session if logged in
      const savedSession = localStorage.getItem("argus_auth_session");
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.user) {
          setCurrentUser(parsed.user);
          setOrganization(parsed.organization || null);
          setIsAuthenticated(true);
          setAvailableUsers([parsed.user]);

          // Asynchronously verify with server immediately to catch accounts deleted while away
          if (parsed.user.email) {
            verifySession(parsed.user.email, parsed.user.orgId);
          }
        }
      }
    } catch (e) {
      console.error("Error restoring session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.orgId && currentUser?.email) {
      fetch(`/api/users?orgId=${encodeURIComponent(currentUser.orgId)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((users: UserSession[]) => {
          if (Array.isArray(users)) {
            if (users.length > 0) {
              setAvailableUsers(users);
            }
            // For franchise and HO staff, verify currentUser still exists in active org personnel
            if (currentUser.role !== "super_admin" && users.length > 0) {
              const currentEmail = currentUser.email.toLowerCase();
              const userStillExists = users.some(
                (u) => (u.email && u.email.toLowerCase() === currentEmail) || u.id === currentUser.id
              );
              if (!userStillExists) {
                console.warn("[Auth] Current user removed from organization personnel directory. Booting session.");
                logout("account_deleted");
              }
            }
          }
        })
        .catch((err) => console.error("Failed to load org users:", err));
    }
  }, [currentUser?.orgId, currentUser?.email, currentUser?.role]);

  // Window focus & visibility & heartbeat listener: kick deleted users immediately when tab becomes active
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.email) return;

    let isChecking = false;
    const checkLiveness = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        await verifySession(currentUser.email, currentUser.orgId);
      } finally {
        isChecking = false;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkLiveness();
      }
    };

    window.addEventListener("focus", checkLiveness);
    document.addEventListener("visibilitychange", handleVisibility);

    // Heartbeat check every 25 seconds while tab is open
    const interval = setInterval(checkLiveness, 25000);

    return () => {
      window.removeEventListener("focus", checkLiveness);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [isAuthenticated, currentUser?.email, currentUser?.orgId]);

  const loginWithGoogle = async (
    email: string,
    name?: string,
    avatar?: string
  ): Promise<{ success: boolean; error?: string; code?: string; redirectUrl?: string }> => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          name,
          avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error, code: data.code };
      }

      setCurrentUser(data.user);
      setOrganization(data.organization || null);
      setIsAuthenticated(true);

      localStorage.setItem(
        "argus_auth_session",
        JSON.stringify({ user: data.user, organization: data.organization })
      );
      localStorage.setItem("argus_current_user_id", data.user.id);

      return { success: true, redirectUrl: data.redirectUrl };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to sign in with Google" };
    }
  };

  const registerWithGoogle = async (
    companyName: string,
    gstin: string,
    email: string,
    name?: string,
    avatar?: string
  ): Promise<{ success: boolean; error?: string; redirectUrl?: string }> => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          companyName,
          gstin,
          email,
          name,
          avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      setCurrentUser(data.user);
      setOrganization(data.organization);
      setIsAuthenticated(true);

      localStorage.setItem(
        "argus_auth_session",
        JSON.stringify({ user: data.user, organization: data.organization })
      );

      return { success: true, redirectUrl: "/pending-approval" };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };


  const switchRole = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("argus_current_user_id", user.id);
      localStorage.setItem(
        "argus_auth_session",
        JSON.stringify({ user, organization })
      );
    }
  };

  const registerNewUser = (newUser: UserSession) => {
    setAvailableUsers((prev) => {
      if (prev.some((u) => u.id === newUser.id)) return prev;
      const updated = [...prev, newUser];
      try {
        const customUsersJson = localStorage.getItem("argus_custom_users");
        const existing: UserSession[] = customUsersJson ? JSON.parse(customUsersJson) : [];
        if (!existing.some((u) => u.id === newUser.id)) {
          localStorage.setItem("argus_custom_users", JSON.stringify([...existing, newUser]));
        }
      } catch (e) {
        console.error("Error persisting user:", e);
      }
      return updated;
    });
  };

  const isSuperAdmin = currentUser?.role === "super_admin";
  const isHeadOffice =
    isSuperAdmin ||
    currentUser?.role === "head_office_admin" ||
    currentUser?.role === "finance_accounts";
  const canApprovePrice = isSuperAdmin || currentUser?.role === "head_office_admin";
  const canEditPriceMaster = isSuperAdmin || currentUser?.role === "head_office_admin";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        organization,
        isAuthenticated,
        isLoading,
        setCurrentUser,
        setOrganization,
        switchRole,
        availableUsers,
        registerNewUser,
        loginWithGoogle,
        registerWithGoogle,
        logout,
        isSuperAdmin,
        isHeadOffice,
        canApprovePrice,
        canEditPriceMaster,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
