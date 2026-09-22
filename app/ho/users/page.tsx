"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { MOCK_USERS } from "@/lib/mockData";
import {
  Users,
  Shield,
  Building2,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

export default function UsersAndRolesPage() {
  const { currentUser, switchRole, availableUsers } = useAuth();

  const rolePermissions = [
    {
      role: "Head Office Super Admin",
      code: "head_office_admin",
      access:
        "Full access: Master data, product & price control, territory mapping, discount override approval, targets, consolidated reports.",
      usersCount: 2,
    },
    {
      role: "Franchise Admin",
      code: "franchise_admin",
      access:
        "Franchise team management, leads, opportunities, standard quotations, orders, installations, support, commissions.",
      usersCount: 5,
    },
    {
      role: "Franchise Sales",
      code: "franchise_sales",
      access:
        "Leads, follow-ups, demos, quotations within allowed discount limits; read-only access to price master.",
      usersCount: 14,
    },
    {
      role: "Service Engineer",
      code: "service_engineer",
      access:
        "Assigned machine installations, 5-step checklist, operator training, customer digital sign-off, support tickets.",
      usersCount: 8,
    },
    {
      role: "Finance / Accounts",
      code: "finance_accounts",
      access:
        "Milestone payments receipt, outstanding balances, commission calculation, disbursement, financial audit.",
      usersCount: 3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
          Role-Based Access Control (RBAC) & Users Directory
        </h1>
        <p className="text-xs text-slate-500">
          Enforces franchise-level data isolation, feature authorization, and operational boundaries.
        </p>
      </div>

      {/* Active User Live Simulation Banner */}
      <div className="bg-white rounded-xl border-2 border-orange-300 p-5 shadow-2xs space-y-3 bg-orange-50/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6600]" />
            <span className="font-extrabold text-slate-900 text-sm">
              Live Role Switcher Active: Currently Acting As
            </span>
          </div>
          <span className="text-xs bg-[#FF6600] text-white font-bold px-2.5 py-0.5 rounded-full">
            {currentUser.name} ({currentUser.role.replace(/_/g, " ")})
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Click any user profile below to immediately switch session persona and test screen visibility, menu navigation, and permissions live.
        </p>
      </div>

      {/* User Profiles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
            Active User Personas in Demonstration System
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>User Name & Email</th>
                <th>Role</th>
                <th>Assigned Franchise</th>
                <th>Permission Scope</th>
                <th className="text-right">Switch Live Persona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {availableUsers.map((usr) => {
                const isCurrent = usr.id === currentUser.id;

                return (
                  <tr
                    key={usr.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCurrent ? "bg-orange-50/40" : ""
                    }`}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#293033] text-white font-bold text-xs flex items-center justify-center">
                          {usr.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{usr.name}</div>
                          <div className="text-[11px] text-slate-400">{usr.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded capitalize">
                        {usr.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-slate-800">
                        {usr.franchiseName || "Head Office Central Command"}
                      </div>
                    </td>
                    <td className="text-xs text-slate-600 max-w-xs">
                      {rolePermissions.find((r) => r.code === usr.role)?.access}
                    </td>
                    <td className="text-right">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Role</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => switchRole(usr.id)}
                          className="px-3 py-1 bg-[#293033] hover:bg-[#FF6600] text-white text-xs font-bold rounded transition-colors"
                        >
                          Switch to User
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#FF6600]" />
          <span>Role Access Matrix (Section 2 Specification)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolePermissions.map((rp) => (
            <div key={rp.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{rp.role}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                  {rp.usersCount} Active Accounts
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rp.access}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
