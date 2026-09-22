"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession } from "./types";
import { MOCK_USERS } from "./mockData";

interface AuthContextType {
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  switchRole: (userId: string) => void;
  availableUsers: UserSession[];
  registerNewUser: (user: UserSession) => void;
  isHeadOffice: boolean;
  canApprovePrice: boolean;
  canEditPriceMaster: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession>(MOCK_USERS[1]); // Default to Coimbatore Franchise Admin
  const [availableUsers, setAvailableUsers] = useState<UserSession[]>(MOCK_USERS);

  useEffect(() => {
    try {
      const customUsersJson = localStorage.getItem("argus_custom_users");
      let allUsers = [...MOCK_USERS];
      if (customUsersJson) {
        const customUsers: UserSession[] = JSON.parse(customUsersJson);
        const toAdd = customUsers.filter((cu) => !allUsers.some((u) => u.id === cu.id));
        allUsers = [...allUsers, ...toAdd];
        setAvailableUsers(allUsers);
      }
      const saved = localStorage.getItem("argus_current_user_id");
      if (saved) {
        const found = allUsers.find((u) => u.id === saved);
        if (found) setCurrentUser(found);
      }
    } catch (e) {
      console.error("Error restoring session:", e);
    }
  }, []);

  const switchRole = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("argus_current_user_id", user.id);
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

  const isHeadOffice = currentUser.role === "head_office_admin" || currentUser.role === "finance_accounts";
  const canApprovePrice = currentUser.role === "head_office_admin";
  const canEditPriceMaster = currentUser.role === "head_office_admin";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        availableUsers,
        registerNewUser,
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
