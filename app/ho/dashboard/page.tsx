"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { FranchiseSalesBarChart } from "@/components/dashboard/FranchiseSalesBarChart";
import { ProductCategoryDonutChart } from "@/components/dashboard/ProductCategoryDonutChart";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Building2,
  Users,
  Target,
  DollarSign,
  Clock,
  Wrench,
  LifeBuoy,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileCheck,
} from "lucide-react";

export default function HeadOfficeDashboard() {
  const { currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHoData() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics?view=ho");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadHoData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Head Office Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
              Head Office Central Command Dashboard
            </h1>
            <span className="bg-[#293033] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Multi-Franchise View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time aggregate oversight across all {data?.totalFranchises ?? "all"} franchise territories, approvals, quotas and SLA health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ho/franchises"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage {data?.totalFranchises ? `${data.totalFranchises} Franchises` : "Franchises"}</span>
          </Link>
          <Link
            href="/quotations"
            className="px-3.5 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Review Price Overrides</span>
          </Link>
        </div>
      </div>

      {/* Multi-Franchise KPI Grid (Matching Section 3.2 & Mockup 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Franchises"
          value={data?.totalFranchises ?? 12}
          icon={Building2}
          trend="+ 2"
          isPositiveTrend={true}
          colorScheme="blue"
        />
        <KpiCard
          title="Total Leads"
          value={data?.totalLeads ?? 428}
          icon={Users}
          trend="+ 18%"
          isPositiveTrend={true}
          colorScheme="sky"
        />
        <KpiCard
          title="Opportunities"
          value={data?.totalOpps ?? 186}
          icon={Target}
          trend="+ 16%"
          isPositiveTrend={true}
          colorScheme="emerald"
        />
        <KpiCard
          title="Total Sales"
          value={data?.totalSales ?? "₹48.7 L"}
          icon={DollarSign}
          trend="+ 22%"
          isPositiveTrend={true}
          colorScheme="purple"
        />
        <KpiCard
          title="Pending Payments"
          value={data?.pendingPayments ?? "₹12.4 L"}
          icon={Clock}
          trend="- 8%"
          isPositiveTrend={false}
          colorScheme="indigo"
        />
        <KpiCard
          title="Installations"
          value={data?.installationsPending ?? 67}
          icon={Wrench}
          trend="+ 25%"
          isPositiveTrend={true}
          colorScheme="teal"
        />
        <KpiCard
          title="Support Tickets"
          value={data?.activeTickets ?? 134}
          icon={LifeBuoy}
          trend="- 12%"
          isPositiveTrend={false}
          colorScheme="rose"
        />
        <KpiCard
          title="Renewals (Due)"
          value={data?.renewalsDue ?? "₹8.9 L"}
          icon={RefreshCw}
          trend="+ 30%"
          isPositiveTrend={true}
          colorScheme="amber"
        />
      </div>

      {/* Franchise Comparison Bar Chart & Product Category Donut Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <FranchiseSalesBarChart data={data?.franchiseSalesBreakdown} />
        </div>
        <div className="lg:col-span-5">
          <ProductCategoryDonutChart data={data?.categoryBreakdown} />
        </div>
      </div>

      {/* Alerts, Approvals & Territory Conflicts Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6600]" />
            <h3 className="font-semibold text-sm text-[#293033] tracking-tight">Alerts & Special Approvals Queue</h3>
          </div>
          <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
            3 Actions Requiring Head Office Attention
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider">Price Override</span>
              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">Action Needed</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Apex Tooling Solutions (QT-9204)</h4>
            <p className="text-xs text-slate-600">
              Franchise requested 15% discount on ARG-CL-200 (Policy Max: 10%). Reason: Competitor price matching.
            </p>
            <Link
              href="/quotations/QT-9204"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6600] hover:underline pt-1"
            >
              <span>Review Commercials & Authorize</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Territory Conflict</span>
              <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded">Conflict</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">Lead LD-1043 (PIN 641601)</h4>
            <p className="text-xs text-slate-600">
              Customer located in Tiruppur boundary overlapping Coimbatore & Salem franchises. Needs territory allocation.
            </p>
            <Link
              href="/leads"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline pt-1"
            >
              <span>Resolve Territory Routing</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Support SLA</span>
              <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">2h Remaining</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800">TK-1056: Sri Venkatesh Industries</h4>
            <p className="text-xs text-slate-600">
              Spindle drive breakdown error E-04 on VMC-700. Critical 4-hour SLA deadline in 2 hours. Ramesh Kumar assigned.
            </p>
            <Link
              href="/support/TK-1056"
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline pt-1"
            >
              <span>Monitor Support Progress</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
