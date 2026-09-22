"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "approval" | "conflict" | "sla" | "lead" | "commission" | "service" | "renewal" | "contract";
  link: string;
  unread: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const HO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "ho-1",
    title: "Special Price Approval Needed",
    desc: "QT-9204: Apex Tooling Solutions (15% discount requested on ARG-CL-200)",
    time: "10 mins ago",
    type: "approval",
    link: "/quotations/QT-9204",
    unread: true,
  },
  {
    id: "ho-2",
    title: "Territory Boundary Conflict",
    desc: "Lead LD-1043: Tiruppur PIN 641601 assigned to multiple franchises",
    time: "1 hour ago",
    type: "conflict",
    link: "/leads",
    unread: true,
  },
  {
    id: "ho-3",
    title: "Critical Support SLA Alert",
    desc: "TK-1056: Sri Venkatesh Industries Spindle E-04 error (2h remaining)",
    time: "2 hours ago",
    type: "sla",
    link: "/support/TK-1056",
    unread: true,
  },
  {
    id: "ho-4",
    title: "Franchise Partner Agreement",
    desc: "Annual target review due for Coimbatore Franchise (FR-CBE)",
    time: "5 hours ago",
    type: "contract",
    link: "/ho/franchises",
    unread: false,
  },
];

const FRANCHISE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "fr-1",
    title: "Quotation Approved by HO",
    desc: "QT-9201: Lakshmi Precision Tools (₹18.5L) discount authorized by Head Office",
    time: "15 mins ago",
    type: "approval",
    link: "/quotations/QT-9201",
    unread: true,
  },
  {
    id: "fr-2",
    title: "New High-Value Lead Assigned",
    desc: "Lead LD-1048: Texmo Industries auto-routed to your territory",
    time: "45 mins ago",
    type: "lead",
    link: "/leads",
    unread: true,
  },
  {
    id: "fr-3",
    title: "Commission Payout Credited",
    desc: "₹45,000 commission settlement processed for Order SO-2024-089",
    time: "3 hours ago",
    type: "commission",
    link: "/commissions",
    unread: true,
  },
  {
    id: "fr-4",
    title: "Installation Scheduled",
    desc: "ARG-VMC-700 commissioning scheduled tomorrow for Texmo Industries",
    time: "1 day ago",
    type: "service",
    link: "/installations",
    unread: false,
  },
  {
    id: "fr-5",
    title: "AMC Renewal Due in 7 Days",
    desc: "RN-2024-001: Craftsman Automation contract renewal due next week",
    time: "2 days ago",
    type: "renewal",
    link: "/renewals",
    unread: false,
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isHeadOffice } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize or re-populate based on the active role
  useEffect(() => {
    if (isHeadOffice) {
      setNotifications(HO_NOTIFICATIONS);
    } else {
      setNotifications(FRANCHISE_NOTIFICATIONS);
    }
  }, [isHeadOffice]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
