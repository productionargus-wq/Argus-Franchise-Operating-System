"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession } from "./types";
import { MOCK_USERS } from "./mockData";

interface AuthContextType {
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  switchRole: (userId: string) => void;
  availableUsers: UserSession[];
  isHeadOffice: boolean;
  canApprovePrice: boolean;
  canEditPriceMaster: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession>(MOCK_USERS[1]); // Default to Coimbatore Franchise Admin

  useEffect(() => {
    const saved = localStorage.getItem("argus_current_user_id");
    if (saved) {
      const found = MOCK_USERS.find((u) => u.id === saved);
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchRole = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("argus_current_user_id", user.id);
    }
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
        availableUsers: MOCK_USERS,
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
