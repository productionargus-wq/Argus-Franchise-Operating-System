"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Opportunity } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Target,
  Search,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Plus,
} from "lucide-react";

export default function OpportunitiesPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

  useEffect(() => {
    async function loadOpps() {
      try {
        setLoading(true);
        const url = isHeadOffice
          ? "/api/opportunities"
          : `/api/opportunities?franchiseId=${currentUser.franchiseId || "FR-CBE"}`;
        const res = await fetch(url);
        const data = await res.json();
        setOpportunities(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOpps();
  }, [currentUser, isHeadOffice]);

  const filtered = opportunities.filter((o) => {
    const matchSearch =
      o.opportunityId.toLowerCase().includes(search.toLowerCase()) ||
      o.companyName.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "ALL" || o.stage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">Opportunities & Technical Demos</h1>
          <p className="text-xs text-slate-500">
            Track deals through qualification, spindle test cut demos, quotations, and closing.
          </p>
        </div>

        <Link
          href="/leads"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View Leads to Convert →</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Opportunity ID, Customer, Machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-full sm:w-48 text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          >
            <option value="ALL">All Stages</option>
            <option value="Qualified">Qualified</option>
            <option value="Demo">Demo Conducted</option>
            <option value="Quotation">Quotation</option>
            <option value="Negotiation">Negotiation</option>
            <option value="PO Expected">PO Expected</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">Loading opportunities...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">No opportunities found.</div>
        ) : (
          filtered.map((op) => (
            <div
              key={op._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#FF6600] uppercase tracking-wider">
                      {op.opportunityId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{op.companyName}</h3>
                    <p className="text-xs text-slate-500">{op.customerName}</p>
                  </div>
                  <StatusBadge status={op.stage} />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Machine Interest:</span>
                    <span className="font-semibold text-slate-800">{op.product}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Expected Deal Value:</span>
                    <span className="font-bold text-emerald-700">₹{op.expectedValue.toLocaleString("en-IN")}</span>
                  </div>
                  {op.demo && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">Demo Status:</span>
                      <span className="font-semibold text-purple-700">
                        {op.demo.status} ({op.demo.result || "Awaiting Outcome"})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Franchise: {op.franchiseName}</span>
                <Link
                  href={`/opportunities/${op.opportunityId}`}
                  className="px-3 py-1.5 bg-[#293033] hover:bg-[#FF6600] text-white font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  <span>Manage Opportunity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
