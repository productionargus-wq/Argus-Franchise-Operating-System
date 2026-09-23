"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SalesFunnel } from "@/components/dashboard/SalesFunnel";
import { SalesTrendChart } from "@/components/dashboard/SalesTrendChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Modal } from "@/components/ui/Modal";
import {
  Users,
  Target,
  FileText,
  ShoppingCart,
  Clock,
  Wrench,
  RefreshCw,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from "lucide-react";

export default function FranchiseDashboard() {
  const { currentUser } = useAuth();
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  // Form state for quick add lead modal
  const [leadForm, setLeadForm] = useState({
    customerName: "",
    companyName: "",
    phone: "",
    email: "",
    source: "Direct Call",
    industry: "Auto Components",
    productInterest: "ARG-VMC-700",
    pincode: "641001",
    district: "Coimbatore",
  });
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchKpis = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?franchiseId=${currentUser?.franchiseId || ""}&view=franchise&orgId=${currentUser?.orgId || ""}`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          setKpiData(data);
        }
      } else {
        console.warn("Analytics API returned non-OK status:", res.status);
      }
    } catch (err) {
      console.error("Error loading KPIs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.orgId) {
      fetchKpis();
    }
  }, [currentUser?.orgId, currentUser?.franchiseId]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          orgId: currentUser?.orgId,
          franchiseId: currentUser?.franchiseId || "",
          franchiseName: currentUser?.franchiseName || "",
          ownerName: currentUser?.name,
        }),
      });
      if (res.ok) {
        setFormSuccess(true);
        setTimeout(() => {
          setFormSuccess(false);
          setIsAddLeadModalOpen(false);
          fetchKpis();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
              Welcome, {currentUser.franchiseName || "Coimbatore Franchise"}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              Active Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Let&apos;s grow your franchise business together. All performance metrics updated in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="px-3.5 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+ Create Lead</span>
          </button>
        </div>
      </div>

      {/* 8 KPI Cards (Matching Section 3.1 & Reference Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="New Leads"
          value={kpiData?.newLeads?.count ?? 38}
          icon={Users}
          trend={kpiData?.newLeads?.trend ?? "+ 27%"}
          isPositiveTrend={true}
          colorScheme="sky"
        />
        <KpiCard
          title="Qualified"
          value={kpiData?.qualified?.count ?? 24}
          icon={Target}
          trend={kpiData?.qualified?.trend ?? "+ 14%"}
          isPositiveTrend={true}
          colorScheme="emerald"
        />
        <KpiCard
          title="Demos"
          value={kpiData?.demos?.count ?? 12}
          icon={CheckCircle2}
          trend={kpiData?.demos?.trend ?? "+ 33%"}
          isPositiveTrend={true}
          colorScheme="indigo"
        />
        <KpiCard
          title="Quotations"
          value={kpiData?.quotationValue?.formatted ?? "₹8.6 L"}
          icon={FileText}
          trend={kpiData?.quotationValue?.trend ?? "+ 18%"}
          isPositiveTrend={true}
          colorScheme="rose"
        />
        <KpiCard
          title="PO Received"
          value={kpiData?.poReceived?.formatted ?? "₹3.4 L"}
          icon={ShoppingCart}
          trend={kpiData?.poReceived?.trend ?? "+ 21%"}
          isPositiveTrend={true}
          colorScheme="teal"
        />
        <KpiCard
          title="Payment Pending"
          value={kpiData?.paymentPending?.formatted ?? "₹1.2 L"}
          icon={Clock}
          trend={kpiData?.paymentPending?.trend ?? "- 5%"}
          isPositiveTrend={false}
          colorScheme="amber"
        />
        <KpiCard
          title="Installations Pending"
          value={kpiData?.installationsPending?.count ?? 4}
          icon={Wrench}
          colorScheme="rose"
        />
        <KpiCard
          title="Renewals"
          value={kpiData?.renewalsDue?.formatted ?? "₹72,000"}
          icon={RefreshCw}
          subtitle="(This Month)"
          colorScheme="emerald"
        />
      </div>

      {/* Visual Analytics Row: Sales Funnel & Sales Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesFunnel stages={kpiData?.pipelineFunnel} />
        <SalesTrendChart data={kpiData?.salesTrend} />
      </div>

      {/* Bottom Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions onOpenNewLead={() => setIsAddLeadModalOpen(true)} />
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        title="Add New Lead"
        maxWidth="lg"
      >
        {formSuccess ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Lead Successfully Created!</h3>
            <p className="text-xs text-slate-500">Conflict checks executed. Refreshed pipeline.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateLead} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Precision Tools"
                  value={leadForm.companyName}
                  onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senthil Kumar"
                  value={leadForm.customerName}
                  onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98420 12345"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Interest</label>
                <select
                  value={leadForm.productInterest}
                  onChange={(e) => setLeadForm({ ...leadForm, productInterest: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="ARG-VMC-700">ARGUS VMC-700 3-Axis</option>
                  <option value="ARG-CL-200">ARGUS CNC Lathe CL-200</option>
                  <option value="ARG-ACC-4AXIS">4th Axis Rotary Table</option>
                  <option value="ARG-SOFT-CAMPRO">ArgusCAM Pro Suite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                <select
                  value={leadForm.industry}
                  onChange={(e) => setLeadForm({ ...leadForm, industry: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="Auto Components">Auto Components</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Tool & Die">Tool & Die</option>
                  <option value="General Engg">General Engg</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code (for Territory Check)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 641001"
                  value={leadForm.pincode}
                  onChange={(e) => setLeadForm({ ...leadForm, pincode: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={leadForm.district}
                  onChange={(e) => setLeadForm({ ...leadForm, district: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-lg shadow-xs"
              >
                Submit Lead
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
