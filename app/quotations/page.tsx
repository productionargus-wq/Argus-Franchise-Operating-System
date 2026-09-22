"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Quotation } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  FileText,
  Plus,
  Search,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function QuotationsPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const url = isHeadOffice
        ? "/api/quotations"
        : `/api/quotations?franchiseId=${currentUser.franchiseId || "FR-CBE"}`;
      const res = await fetch(url);
      const data = await res.json();
      setQuotations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, [currentUser, isHeadOffice]);

  const filtered = quotations.filter((q) => {
    const matchSearch =
      q.quoteId.toLowerCase().includes(search.toLowerCase()) ||
      q.companyName.toLowerCase().includes(search.toLowerCase()) ||
      q.opportunityId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Quotations & Price Control Engine
          </h1>
          <p className="text-xs text-slate-500">
            Enforces Head Office minimum selling prices, maximum allowed discounts, and special approval workflows.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation Builder</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Quote ID, Customer, Opportunity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending_Approval">Pending Special Approval</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent to Client</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Company / Customer</th>
                <th>Items (SKUs)</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Grand Total (Inc. GST)</th>
                <th>Price Status</th>
                <th>Valid Until</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Loading quotations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filtered.map((quote) => (
                  <tr key={quote._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-bold text-slate-900 whitespace-nowrap">
                      {quote.quoteId}
                      <span className="text-[10px] text-slate-400 block">v{quote.version}</span>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{quote.companyName}</div>
                      <div className="text-xs text-slate-500">{quote.customerName}</div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-800 font-medium">
                        {quote.items.map((i) => i.sku).join(", ")}
                      </div>
                      <div className="text-[11px] text-slate-400">{quote.items.length} item(s)</div>
                    </td>
                    <td className="font-medium text-slate-700">₹{quote.subtotal.toLocaleString("en-IN")}</td>
                    <td className="font-medium text-red-600">
                      -₹{quote.totalDiscount.toLocaleString("en-IN")}
                    </td>
                    <td className="font-black text-slate-900">
                      ₹{quote.grandTotal.toLocaleString("en-IN")}
                    </td>
                    <td>
                      {quote.requiresSpecialApproval && quote.status === "Pending_Approval" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Special Approval
                        </span>
                      ) : (
                        <StatusBadge status={quote.status} />
                      )}
                    </td>
                    <td className="text-xs text-slate-600 whitespace-nowrap">{quote.validUntil}</td>
                    <td className="text-right">
                      <Link
                        href={`/quotations/${quote.quoteId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#FF6600] hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <span>View / Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
