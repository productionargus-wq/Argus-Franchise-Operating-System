"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession, Organization } from "./types";
import { MOCK_USERS } from "./mockData";

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
  logout: () => void;
  isSuperAdmin: boolean;
  isHeadOffice: boolean;
  canApprovePrice: boolean;
  canEditPriceMaster: boolean;
}

const DEFAULT_USER: UserSession = {
  ...MOCK_USERS[1],
  orgId: "ORG-ARGUS",
  orgName: "Argus CNC Technologies Ltd",
  status: "active",
};

const DEFAULT_ORG: Organization = {
  orgId: "ORG-ARGUS",
  name: "Argus CNC Technologies Ltd",
  gstin: "33AAAAA0000A1Z5",
  adminEmail: "vikram.ho@arguscnc.com",
  adminName: "Vikram Rathore",
  status: "APPROVED",
  createdAt: "2026-01-01",
  approvedAt: "2026-01-01",
  approvedBy: "System Setup",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_USER);
  const [organization, setOrganization] = useState<Organization | null>(DEFAULT_ORG);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableUsers, setAvailableUsers] = useState<UserSession[]>(MOCK_USERS);

  useEffect(() => {
    try {
      // 1. Restore Custom Users List
      const customUsersJson = localStorage.getItem("argus_custom_users");
      let allUsers = [...MOCK_USERS];
      if (customUsersJson) {
        const customUsers: UserSession[] = JSON.parse(customUsersJson);
        const toAdd = customUsers.filter((cu) => !allUsers.some((u) => u.id === cu.id));
        allUsers = [...allUsers, ...toAdd];
        setAvailableUsers(allUsers);
      }

      // 2. Restore Live Session if logged in
      const savedSession = localStorage.getItem("argus_auth_session");
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.user) {
          setCurrentUser(parsed.user);
          setOrganization(parsed.organization || null);
          setIsAuthenticated(true);
        }
      } else {
        const savedId = localStorage.getItem("argus_current_user_id");
        if (savedId) {
          const found = allUsers.find((u) => u.id === savedId);
          if (found) setCurrentUser(found);
        }
      }
    } catch (e) {
      console.error("Error restoring session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("argus_auth_session");
    localStorage.removeItem("argus_current_user_id");
    // Window location change cleanly clears memory state
    if (typeof window !== "undefined") {
      window.location.href = "/login";
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
