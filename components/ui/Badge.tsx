import React from "react";

export type BadgeVariant =
  | "orange"
  | "green"
  | "blue"
  | "red"
  | "yellow"
  | "gray"
  | "purple";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    orange: "bg-orange-50 text-[#FF6600] border-orange-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    gray: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, BadgeVariant> = {
    // Lead & Opp
    New: "blue",
    Qualified: "purple",
    "In Progress": "yellow",
    Converted: "green",
    Lost: "red",
    Demo: "orange",
    Quotation: "blue",
    Negotiation: "yellow",
    "PO Expected": "purple",
    Won: "green",
    // Quotations
    Draft: "gray",
    Pending_Approval: "red",
    Approved: "green",
    Sent: "blue",
    Accepted: "green",
    Rejected: "red",
    // Orders
    Confirmed: "blue",
    "Production/Stock": "yellow",
    QC: "purple",
    Dispatch: "orange",
    Delivered: "green",
    // Support
    Critical: "red",
    High: "orange",
    Medium: "yellow",
    Low: "blue",
    Open: "blue",
    "Waiting Spares": "orange",
    Resolved: "green",
    Closed: "gray",
    // Renewals
    Active: "green",
    Notice_60d: "blue",
    Notice_30d: "yellow",
    Notice_15d: "orange",
    Notice_7d: "red",
    Expired: "red",
    Renewed: "green",
    // General
    Pending: "yellow",
    Received: "green",
    Overdue: "red",
    Payable: "yellow",
    Paid: "green",
    Calculated: "blue",
  };

  const variant = statusMap[status] || "gray";

  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
}
