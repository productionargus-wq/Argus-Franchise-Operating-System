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
    if (!currentUser?.orgId) return;
    const orgId = currentUser.orgId;
    async function loadHoData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics?view=ho&orgId=${encodeURIComponent(orgId)}`);
        if (res.ok) {
          const text = await res.text();
          if (text) {
            const json = JSON.parse(text);
            setData(json);
          }
        } else {
          console.warn("HO Analytics API returned non-OK status:", res.status);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadHoData();
  }, [currentUser?.orgId]);

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
      {/* Dynamic Alerts & Special Approvals Queue */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6600]" />
            <h3 className="font-semibold text-sm text-[#293033] tracking-tight">Alerts & Special Approvals Queue</h3>
          </div>
          {(data?.alerts && data.alerts.length > 0) ? (
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
              {data.alerts.length} Action{data.alerts.length > 1 ? "s" : ""} Requiring Head Office Attention
            </span>
          ) : (
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
              All Clear
            </span>
          )}
        </div>

        {(!data?.alerts || data.alerts.length === 0) ? (
          <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">No Critical Operational Alerts</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quotations requiring discount authorization and critical support SLAs will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.alerts.map((alt: any) => (
              <div key={alt.id} className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider">
                    {alt.type === "special_approval" ? "Price Override" : "Critical Alert"}
                  </span>
                  <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">
                    Action Needed
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{alt.title}</h4>
                <p className="text-xs text-slate-600">{alt.desc}</p>
                <Link
                  href={alt.link}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6600] hover:underline pt-1"
                >
                  <span>Review & Take Action</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
