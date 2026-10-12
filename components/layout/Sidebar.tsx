"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  ShoppingCart,
  Building2,
  Wrench,
  LifeBuoy,
  RefreshCw,
  Coins,
  ShieldAlert,
  MapPin,
  Tag,
  ChevronRight,
  FileCheck,
  ReceiptText,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isHeadOffice, isSuperAdmin, currentUser } = useAuth();

  const superAdminNavItems = [
    { label: "Organization Approvals", href: "/super-admin", icon: ShieldAlert },
  ];

  const franchiseNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: Users },
    { label: "Opportunities / Demos", href: "/opportunities", icon: Target },
    { label: "Quotations", href: "/quotations", icon: FileText },
    { label: "Invoices", href: "/invoices", icon: ReceiptText },
    { label: "Orders / Payments", href: "/orders", icon: ShoppingCart },
    { label: "Customers", href: "/customers", icon: Building2 },
    { label: "Installations / Training", href: "/installations", icon: Wrench },
    { label: "Support Tickets", href: "/support", icon: LifeBuoy },
    { label: "Renewals / AMC", href: "/renewals", icon: RefreshCw },
    { label: "Commission / Reports", href: "/commissions", icon: Coins },
    { label: "Terms & Conditions", href: "/terms", icon: FileCheck },
  ];

  const headOfficeNavItems = [
    { label: "HO Dashboard", href: "/ho/dashboard", icon: LayoutDashboard },
    { label: "Franchises", href: "/ho/franchises", icon: Building2 },
    { label: "Customers (360°)", href: "/customers", icon: Users },
    { label: "Leads", href: "/ho/leads", icon: Target },
    { label: "Quotations & Approvals", href: "/quotations", icon: FileText },
    { label: "Invoices & Billing", href: "/invoices", icon: ReceiptText },
    { label: "Sales & Orders", href: "/ho/orders", icon: ShoppingCart },
    { label: "Installations", href: "/ho/installations", icon: Wrench },
    { label: "Support Monitoring", href: "/ho/support", icon: LifeBuoy },
    { label: "Renewals", href: "/ho/renewals", icon: RefreshCw },
    { label: "Payments / Commission", href: "/ho/commissions", icon: Coins },
    { label: "Price / Product Master", href: "/ho/products", icon: Tag },
    { label: "Partner Terms & Policy", href: "/ho/terms", icon: FileCheck },
    { label: "Territory Management", href: "/ho/territory", icon: MapPin },
    { label: "Users & Roles", href: "/ho/users", icon: Users },
  ];

  const currentNav = isSuperAdmin
    ? superAdminNavItems
    : isHeadOffice
    ? headOfficeNavItems
    : franchiseNavItems;

  const portalLabel = isSuperAdmin
    ? "Super Admin Portal"
    : isHeadOffice
    ? "Head Office Portal"
    : "Franchise Portal";

  const portalDotColor = isSuperAdmin ? "bg-purple-400" : "bg-[#FF6600]";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-[#293033] border-r border-[#1F2426] flex flex-col z-30 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Portal Mode Label */}
        <div className="px-4 py-3 border-b border-[#3A4448]/50 flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          <span>{portalLabel}</span>
          <span className={`w-2 h-2 rounded-full ${portalDotColor}`}></span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            // Robust active check handling top-level, nested dynamic routes, and HO <-> base shared routes
            const normalizedItem = item.href.replace(/^\/ho\//, "/");
            const normalizedPath = pathname.replace(/^\/ho\//, "/");
            const isExactDashboard = item.href === "/dashboard" || item.href === "/ho/dashboard";

            const isActive = isExactDashboard
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                normalizedPath === normalizedItem ||
                normalizedPath.startsWith(normalizedItem + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-[#FF6600] text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:bg-[#3A4448] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Subtle footer */}
        <div className="p-3 border-t border-[#3A4448]/60 bg-[#1F2426]">
          <div className="text-[11px] text-slate-400 text-center font-medium">
            ARGUS CNC Partner OS v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
