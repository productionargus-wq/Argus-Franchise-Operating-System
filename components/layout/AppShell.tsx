"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { AuthProvider } from "@/lib/AuthContext";
import { NotificationProvider } from "@/lib/NotificationContext";

function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Clean full-screen auth layout for unauthenticated flows
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/pending-approval" ||
    pathname === "/access-denied";

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#F8F9FA]">{children}</main>;
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
