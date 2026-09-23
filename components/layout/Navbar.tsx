"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import { DateRangePicker } from "./DateRangePicker";
import {
  Bell,
  ChevronDown,
  Shield,
  Building2,
  Menu,
  X,
  Sparkles,
  CheckCheck,
  Trash2,
  ExternalLink,
  LogOut,
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Navbar({ onToggleSidebar, isSidebarOpen }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, switchRole, availableUsers, isHeadOffice, isSuperAdmin, organization, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => n.unread)
    : notifications;

  const handleRoleSwitch = (userId: string) => {
    const targetUser = availableUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    const targetIsHO =
      targetUser.role === "head_office_admin" || targetUser.role === "finance_accounts";
    const currentIsHO =
      currentUser.role === "head_office_admin" || currentUser.role === "finance_accounts";

    switchRole(userId);
    setShowRoleDropdown(false);

    // Synchronize the main content area route immediately when role scope toggles
    if (targetIsHO !== currentIsHO) {
      if (targetIsHO) {
        // Switching from Franchise -> Head Office
        if (pathname === "/dashboard") {
          router.push("/ho/dashboard");
        } else if (pathname.startsWith("/leads")) {
          router.push("/ho/leads");
        } else if (pathname.startsWith("/orders")) {
          router.push("/ho/orders");
        } else if (pathname.startsWith("/installations")) {
          router.push("/ho/installations");
        } else if (pathname.startsWith("/support")) {
          router.push("/ho/support");
        } else if (pathname.startsWith("/renewals")) {
          router.push("/ho/renewals");
        } else if (pathname.startsWith("/commissions")) {
          router.push("/ho/commissions");
        } else {
          router.push("/ho/dashboard");
        }
      } else {
        // Switching from Head Office -> Franchise
        if (pathname === "/ho/dashboard") {
          router.push("/dashboard");
        } else if (
          pathname.startsWith("/ho/franchises") ||
          pathname.startsWith("/ho/territory") ||
          pathname.startsWith("/ho/users") ||
          pathname.startsWith("/ho/products")
        ) {
          router.push("/dashboard");
        } else if (pathname.startsWith("/ho/leads")) {
          router.push("/leads");
        } else if (pathname.startsWith("/ho/orders")) {
          router.push("/orders");
        } else if (pathname.startsWith("/ho/installations")) {
          router.push("/installations");
        } else if (pathname.startsWith("/ho/support")) {
          router.push("/support");
        } else if (pathname.startsWith("/ho/renewals")) {
          router.push("/renewals");
        } else if (pathname.startsWith("/ho/commissions")) {
          router.push("/commissions");
        } else {
          router.push("/dashboard");
        }
      }
    }
  };

  const handleNotificationClick = (item: { id: string; link: string }) => {
    markAsRead(item.id);
    setShowNotifications(false);
    router.push(item.link);
  };

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
            <div className="bg-white/95 hover:bg-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs flex items-center">
              <Image
                src="/argus-logo.png"
                alt="ARGUSCNC"
                width={140}
                height={30}
                className="h-7 sm:h-8 w-auto object-contain"
                priority
              />
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-[#3A4448] text-slate-300 border border-slate-600">
              Franchise OS
            </span>
          </Link>

          {/* Active Tenant Organization & Role Badge */}
          {isSuperAdmin ? (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/20 text-xs font-bold text-purple-300 border border-purple-400/30">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Platform Super Admin</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2426] text-xs font-medium text-slate-200 border border-[#3A4448]">
                <Building2 className="w-3.5 h-3.5 text-[#FF6600]" />
                <span className="font-semibold">{organization?.name || currentUser.orgName || "Enterprise Workspace"}</span>
              </div>
              {currentUser.franchiseName && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#FF6600]/10 text-xs font-medium text-[#FF6600] border border-[#FF6600]/30">
                  <span>{currentUser.franchiseName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Date Picker, Notifications, and Interactive Multi-Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Dynamic 2026 Date Range Selector */}
          <DateRangePicker />

          {/* Dynamic Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-300 hover:text-white hover:bg-[#3A4448] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6600] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="px-4 py-3 bg-[#293033] text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-[#FF6600] text-white px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 hover:underline transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setFilterUnreadOnly(false)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      !filterUnreadOnly
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilterUnreadOnly(true)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      filterUnreadOnly
                        ? "bg-white text-[#FF6600] shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {displayedNotifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No notifications to display
                    </div>
                  ) : (
                    displayedNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 group ${
                          n.unread ? "bg-orange-50/40" : ""
                        }`}
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {n.unread && (
                                <span className="w-2 h-2 rounded-full bg-[#FF6600] shrink-0" />
                              )}
                              <span>{n.title}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{n.desc}</p>
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#FF6600]">
                            <span>Take Action</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(n.id);
                          }}
                          className="text-slate-300 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Link */}
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

          {/* Interactive Role Switcher with Synchronized Content Redirection */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1F2426] hover:bg-[#3A4448] border border-[#3A4448] text-xs font-medium transition-all cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
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
                        onClick={() => handleRoleSwitch(user.id)}
                        className={`w-full text-left p-2.5 rounded-md flex items-center gap-3 transition-colors cursor-pointer ${
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

                {/* Sign Out Button */}
                <div className="p-2 bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={logout}
                    className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

