"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import {
  Bell,
  Calendar,
  ChevronDown,
  Shield,
  User,
  Building2,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const { currentUser, switchRole, availableUsers, isHeadOffice } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Special Price Approval Needed",
      desc: "QT-9204: Apex Tooling Solutions (15% discount requested on ARG-CL-200)",
      time: "10 mins ago",
      type: "approval",
      unread: true,
    },
    {
      id: 2,
      title: "Territory Boundary Conflict",
      desc: "Lead LD-1043: Tiruppur PIN 641601 assigned to multiple franchises",
      time: "1 hour ago",
      type: "conflict",
      unread: true,
    },
    {
      id: 3,
      title: "Critical Support SLA Alert",
      desc: "TK-1056: Sri Venkatesh Industries Spindle E-04 error (2h remaining)",
      time: "2 hours ago",
      type: "sla",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="bg-[#293033] text-white border-b border-[#1E2426] sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded text-slate-300 hover:text-white hover:bg-[#3A4448] transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href={isHeadOffice ? "/ho/dashboard" : "/dashboard"} className="flex items-center gap-2.5">
            <Image
              src="/argus-logo-dark-navbar.png"
              alt="ARGUSCNC"
              width={160}
              height={36}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-[#3A4448] text-slate-300 border border-slate-600">
              Franchise OS
            </span>
          </Link>

          {/* Current Franchise Badge */}
          {currentUser.franchiseName ? (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2426] text-xs font-medium text-[#FF6600] border border-[#3A4448]">
              <Building2 className="w-3.5 h-3.5" />
              <span>{currentUser.franchiseName}</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2426] text-xs font-medium text-emerald-400 border border-[#3A4448]">
              <Shield className="w-3.5 h-3.5" />
              <span>Head Office Central Admin</span>
            </div>
          )}
        </div>

        {/* Right: Date Picker, Notifications, and Interactive Multi-Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded bg-[#1F2426] border border-[#3A4448] text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-[#FF6600]" />
            <span>01 Dec 2024 - 31 Dec 2024</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-[#3A4448] transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6600] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
                <div className="px-4 py-3 bg-[#293033] text-white flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider">Notifications & Alerts</span>
                  <span className="text-[11px] bg-[#FF6600] text-white px-1.5 py-0.5 rounded font-bold">
                    {unreadCount} new
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                        n.unread ? "bg-orange-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <Link
                    href={isHeadOffice ? "/ho/dashboard" : "/dashboard"}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[#FF6600] hover:underline"
                  >
                    View All Operational Alerts →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1F2426] hover:bg-[#3A4448] border border-[#3A4448] text-xs font-medium transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#FF6600] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.avatar || "U"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white text-xs font-semibold leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-300 capitalize">
                  {currentUser.role.replace(/_/g, " ")}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
                <div className="px-3.5 py-2.5 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
                  <span>Switch Live Role / Franchise</span>
                </div>
                <div className="p-1.5 divide-y divide-slate-100">
                  {availableUsers.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchRole(user.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-md flex items-center gap-3 transition-colors ${
                          isSelected ? "bg-orange-50 border border-orange-200" : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected ? "bg-[#FF6600] text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                            <span>{user.name}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-[#FF6600] text-white px-1.5 py-0.2 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            {user.role.replace(/_/g, " ")}
                          </div>
                          <div className="text-[10px] text-[#FF6600] font-medium">
                            {user.franchiseName || "Head Office Super Admin"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
