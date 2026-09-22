"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { AuthProvider } from "@/lib/AuthContext";
import { NotificationProvider } from "@/lib/NotificationContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <NotificationProvider>
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
      </NotificationProvider>
    </AuthProvider>
  );
}
