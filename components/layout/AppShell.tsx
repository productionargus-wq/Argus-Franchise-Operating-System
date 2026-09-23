"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { NotificationProvider } from "@/lib/NotificationContext";

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Clean full-screen auth layout for unauthenticated flows
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/pending-approval" ||
    pathname === "/access-denied";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isAuthPage, router]);

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#F8F9FA]">{children}</main>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#293033] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FF6600] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-300 font-medium">Securing session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#293033] flex flex-col">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0 transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainContent>{children}</MainContent>
      </NotificationProvider>
    </AuthProvider>
  );
}
