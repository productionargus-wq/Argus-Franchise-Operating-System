"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { CommissionRecord } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Coins,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  FileCheck,
} from "lucide-react";

export default function CommissionsPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const url = isHeadOffice
        ? "/api/commissions"
        : `/api/commissions?franchiseId=${currentUser.franchiseId || "FR-CBE"}`;
      const res = await fetch(url);
      const data = await res.json();
      setCommissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, [currentUser, isHeadOffice]);

  const handleUpdateStatus = async (
    id: string,
    status: CommissionRecord["status"]
  ) => {
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentReference: `NEFT-ARGUS-${Math.floor(10000 + Math.random() * 90000)}`,
        }),
      });
      if (res.ok) {
        loadCommissions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = commissions.filter((c) => {
    return (
      c.commissionId.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName.toLowerCase().includes(search.toLowerCase()) ||
      c.orderId.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalCalculated = commissions.reduce((acc, c) => acc + c.calculatedAmount, 0);
  const totalPaid = commissions
    .filter((c) => c.status === "Paid")
    .reduce((acc, c) => acc + c.calculatedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Franchise Commission & Settlement Engine
          </h1>
          <p className="text-xs text-slate-500">
            Enforcing specification logic: Customer Payment Received &gt; Eligible Revenue &gt; Commission Calculation &gt; Approval &gt; Payable &gt; Paid.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Accrued Commission
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            ₹{totalCalculated.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">From verified customer payments</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Settled / Paid to Franchise
          </span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            ₹{totalPaid.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-emerald-600 mt-0.5 block">Transferred via NEFT/RTGS</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Payable & Pending Approval
          </span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">
            ₹{(totalCalculated - totalPaid).toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-amber-600 mt-0.5 block">Pending Head Office finance sign-off</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
            Transaction-Level Commission Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Commission ID</th>
                <th>Order Ref & Customer</th>
                <th>Franchise Partner</th>
                <th>Eligible Revenue Received</th>
                <th>Commission Rate</th>
                <th>Calculated Amount</th>
                <th>Settlement Status</th>
                <th className="text-right">Settlement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading commission data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No commission records found.
                  </td>
                </tr>
              ) : (
                filtered.map((comm) => (
                  <tr key={comm._id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-bold text-slate-900 whitespace-nowrap">
                      {comm.commissionId}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{comm.customerName}</div>
                      <div className="text-xs text-[#FF6600] font-semibold">{comm.orderId}</div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-slate-800">
                        {comm.franchiseName}
                      </div>
                    </td>
                    <td className="font-medium text-slate-800">
                      ₹{comm.eligibleRevenue.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-xs">
                        {comm.commissionRate}%
                      </span>
                    </td>
                    <td className="font-black text-emerald-700">
                      ₹{comm.calculatedAmount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <StatusBadge status={comm.status} />
                    </td>
                    <td className="text-right">
                      {isHeadOffice && comm.status !== "Paid" ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {comm.status === "Calculated" && (
                            <button
                              onClick={() => handleUpdateStatus(comm._id, "Payable")}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-xs font-bold transition-colors"
                            >
                              Mark Payable
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(comm._id, "Paid")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
                          >
                            Disburse (Paid)
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {comm.paymentReference || "Payment Pending"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
