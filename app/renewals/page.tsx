"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Renewal } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  RefreshCw,
  Search,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Mail,
  MessageSquare,
  Bell,
  ArrowRight,
} from "lucide-react";

export default function RenewalsPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadRenewals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentUser?.orgId) params.set("orgId", currentUser.orgId);
      if (!isHeadOffice && currentUser?.franchiseId) {
        params.set("franchiseId", currentUser.franchiseId);
      }
      const url = `/api/renewals?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setRenewals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRenewals();
  }, [currentUser, isHeadOffice]);

  const handleSendReminder = async (
    id: string,
    type: "60d" | "30d" | "15d" | "7d" | "Escalation",
    channel: "Email" | "WhatsApp"
  ) => {
    try {
      const res = await fetch(`/api/renewals/${id}/reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, channel, orgId: currentUser?.orgId }),
      });
      if (res.ok) {
        setActionSuccess(`Reminder (${type} via ${channel}) dispatched!`);
        setTimeout(() => setActionSuccess(null), 3000);
        loadRenewals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = renewals.filter((r) => {
    return (
      r.renewalId.toLowerCase().includes(search.toLowerCase()) ||
      r.companyName.toLowerCase().includes(search.toLowerCase()) ||
      r.productOrModule.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Warranty, AMC & Software Renewal Engine
          </h1>
          <p className="text-xs text-slate-500">
            Automated multi-stage alerts at 60, 30, 15, and 7 days with escalation logic for expired machines.
          </p>
        </div>

        {actionSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Renewal ID, Customer, Machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          />
        </div>
      </div>

      {/* Renewals Table (Matching Section 3.9 & Mockup 9) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Renewal ID</th>
                <th>Company / Customer</th>
                <th>Product / Module Covered</th>
                <th>Expiry Date</th>
                <th>Days Remaining</th>
                <th>Contract Value</th>
                <th>Status</th>
                <th>Dispatched Reminders</th>
                <th className="text-right">Action Triggers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Loading renewals...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    No active renewals found.
                  </td>
                </tr>
              ) : (
                filtered.map((rn) => {
                  const days = rn.daysRemaining;
                  const isUrgent = days <= 7;
                  const isModerate = days <= 30;

                  return (
                    <tr
                      key={rn._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isUrgent ? "bg-red-50/20" : isModerate ? "bg-amber-50/10" : ""
                      }`}
                    >
                      <td className="font-bold text-slate-900 whitespace-nowrap">{rn.renewalId}</td>
                      <td>
                        <div className="font-bold text-slate-900">{rn.companyName}</div>
                        <div className="text-xs text-slate-500">{rn.customerName}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800">{rn.productOrModule}</div>
                        <div className="text-[11px] text-slate-400">{rn.machineSerial}</div>
                      </td>
                      <td className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {rn.expiryDate}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full ${
                            days <= 7
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : days <= 15
                              ? "bg-orange-100 text-[#FF6600] border border-orange-200"
                              : days <= 30
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{days} Days</span>
                        </span>
                      </td>
                      <td className="font-black text-slate-900">
                        ₹{rn.contractValue.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <StatusBadge status={rn.status} />
                      </td>
                      <td>
                        <div className="flex items-center gap-1 flex-wrap">
                          {rn.remindersSent.length === 0 ? (
                            <span className="text-slate-400 text-[11px]">None yet</span>
                          ) : (
                            rn.remindersSent.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {s.type} ({s.channel})
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleSendReminder(rn._id, "30d", "WhatsApp")}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-bold transition-colors flex items-center gap-1"
                            title="Send 30d WhatsApp Alert"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => handleSendReminder(rn._id, "15d", "Email")}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold transition-colors flex items-center gap-1"
                            title="Send 15d Email Quote"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>

                          {days <= 7 && (
                            <button
                              onClick={() => handleSendReminder(rn._id, "Escalation", "Email")}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                              title="Escalate to Head Office"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Escalate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
