"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { StatusBadge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingCart,
  Wrench,
  LifeBuoy,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  ArrowUpRight,
  Plus,
  Trash2,
  X,
} from "lucide-react";

export default function Customer360Page() {
  const params = useParams();
  const { currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "opportunities" | "quotations" | "orders" | "support" | "renewals" | "upsell"
  >("overview");

  // Custom upsell modal state
  const [showAddUpsell, setShowAddUpsell] = useState(false);
  const [savingUpsell, setSavingUpsell] = useState(false);
  const [upsellForm, setUpsellForm] = useState({
    title: "",
    sku: "",
    estimatedValue: "",
    readiness: "High Interest",
    reason: "",
  });

  const load360 = async () => {
    try {
      setLoading(true);
      const orgParam = currentUser?.orgId ? `?orgId=${encodeURIComponent(currentUser.orgId!)}` : "";
      const res = await fetch(`/api/customers/${params.id}${orgParam}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load360();
  }, [params.id, currentUser]);

  const handleAddCustomUpsell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.customer) return;
    setSavingUpsell(true);
    try {
      const existing = Array.isArray(data.customer.customUpsells) ? data.customer.customUpsells : [];
      const newEntry = {
        title: upsellForm.title,
        sku: upsellForm.sku || `UP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        estimatedValue: Number(upsellForm.estimatedValue) || 100000,
        readiness: upsellForm.readiness,
        reason: upsellForm.reason,
      };
      const updatedList = [...existing, newEntry];
      const res = await fetch(`/api/customers/${data.customer.customerId || data.customer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customUpsells: updatedList,
          orgId: currentUser?.orgId,
        }),
      });
      if (res.ok) {
        setShowAddUpsell(false);
        setUpsellForm({ title: "", sku: "", estimatedValue: "", readiness: "High Interest", reason: "" });
        load360();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingUpsell(false);
    }
  };

  const handleDeleteCustomUpsell = async (sku: string) => {
    if (!data?.customer) return;
    if (!confirm("Are you sure you want to remove this custom upsell opportunity?")) return;
    try {
      const existing = Array.isArray(data.customer.customUpsells) ? data.customer.customUpsells : [];
      const updatedList = existing.filter((u: any) => u.sku !== sku);
      const res = await fetch(`/api/customers/${data.customer.customerId || data.customer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customUpsells: updatedList,
          orgId: currentUser?.orgId,
        }),
      });
      if (res.ok) {
        load360();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading Customer 360° Profile...</div>;
  }

  if (!data || !data.customer) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600 text-sm font-bold">Customer profile not found.</p>
        <Link href="/customers" className="text-xs text-[#FF6600] underline font-semibold">
          Return to Customers
        </Link>
      </div>
    );
  }

  const { customer, opportunities, quotations, orders, installations, tickets, renewals, upsells } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#293033] tracking-tight">
                Customer 360°: {customer.companyName}
              </h1>
              <span className="bg-orange-100 text-[#FF6600] text-[11px] font-bold px-2 py-0.5 rounded-full">
                Key Account
              </span>
            </div>
            <p className="text-xs text-slate-500">
              GSTIN: {customer.gstin} | Franchise: {customer.franchiseName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/quotations/new?company=${encodeURIComponent(customer.companyName)}&customer=${encodeURIComponent(customer.contactPerson)}`}
            className="px-3.5 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create New Quote</span>
          </Link>
        </div>
      </div>

      {/* Headline KPI Cards (Matching Mockup Screen 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Customer Lifetime Value
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₹{customer.lifetimeValue.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-emerald-600 mt-0.5 block font-medium">Top Tier Automotive Supplier</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active CNC Machinery
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {customer.activeMachinesCount} Units Installed
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">VMC-700, Lathes, 4th Axis</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Support Tickets
          </span>
          <span className="text-2xl font-black text-red-600 mt-1 block">
            {customer.pendingTicketsCount} Open Incident
          </span>
          <span className="text-xs text-red-700 mt-0.5 block font-semibold">1 Critical (SLA in progress)</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Next AMC / Warranty Renewal
          </span>
          <span className="text-2xl font-black text-[#FF6600] mt-1 block">
            {customer.nextRenewalDate}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">Notice-30d Dispatched</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "overview", label: "Overview & Machine Fleet", icon: Building2 },
          { id: "opportunities", label: `Opportunities (${opportunities.length})`, icon: TrendingUp },
          { id: "quotations", label: `Quotations (${quotations.length})`, icon: FileText },
          { id: "orders", label: `Sales Orders (${orders.length})`, icon: ShoppingCart },
          { id: "support", label: `Support Tickets (${tickets.length})`, icon: LifeBuoy },
          { id: "renewals", label: `Renewals (${renewals.length})`, icon: RefreshCw },
          { id: "upsell", label: `Upsell Matrix (${upsells.length})`, icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-[#FF6600] text-[#FF6600]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100">
              Account Demographics
            </h3>
            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                <span className="font-bold text-slate-900">{customer.contactPerson} ({customer.designation})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone & Email</span>
                <div className="font-semibold text-blue-600">{customer.phone}</div>
                <div className="text-slate-600">{customer.email}</div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Factory Address</span>
                <span className="font-medium text-slate-800 leading-relaxed block">{customer.address}</span>
                <span className="text-slate-500">{customer.district}, {customer.state} - PIN: {customer.pincode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Industry Vertical</span>
                <span className="font-bold text-slate-900">{customer.industry}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100">
              Installed Machine Fleet on Shop Floor
            </h3>
            <div className="space-y-3">
              {(installations || []).map((ins: any) => (
                <div
                  key={ins._id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-slate-900">{ins.productName}</span>
                    <div className="text-xs text-[#FF6600] font-bold">Serial: {ins.machineSerial}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Installed on {ins.scheduledDate} by {ins.assignedEngineerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded text-[11px]">
                      Commissioned
                    </span>
                    <Link
                      href={`/installations/${ins.installationId}`}
                      className="text-xs text-blue-600 font-bold hover:underline block mt-1"
                    >
                      View Report →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "opportunities" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">Deals in Pipeline</h3>
          <div className="divide-y divide-slate-100">
            {opportunities.map((o: any) => (
              <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#FF6600] block">{o.opportunityId}</span>
                  <span className="font-semibold text-slate-800">{o.product}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 block">₹{o.expectedValue.toLocaleString("en-IN")}</span>
                  <StatusBadge status={o.stage} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "quotations" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">Quotation Records</h3>
          <div className="divide-y divide-slate-100">
            {quotations.map((q: any) => (
              <div key={q._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{q.quoteId}</span>
                  <span className="text-slate-500">Total: ₹{q.grandTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={q.status} />
                  <Link
                    href={`/quotations/${q.quoteId}`}
                    className="text-xs font-semibold text-[#FF6600] hover:underline"
                  >
                    View Quote →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">Sales Orders & POs</h3>
          <div className="divide-y divide-slate-100">
            {orders.map((so: any) => (
              <div key={so._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{so.orderId} (PO: {so.poNumber})</span>
                  <span className="text-slate-500">Order Value: ₹{so.orderValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={so.orderStatus} />
                  <Link
                    href={`/orders/${so.orderId}`}
                    className="text-xs font-semibold text-[#FF6600] hover:underline"
                  >
                    Track Order →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "support" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">Support Ticket History</h3>
          <div className="divide-y divide-slate-100">
            {tickets.map((t: any) => (
              <div key={t._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{t.ticketId}: {t.category}</span>
                  <span className="text-slate-500">{t.issueDescription}</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                  <Link
                    href={`/support/${t.ticketId}`}
                    className="text-xs font-semibold text-[#FF6600] hover:underline"
                  >
                    View Ticket →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "renewals" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">AMC / Warranty Contracts</h3>
          <div className="divide-y divide-slate-100">
            {renewals.map((r: any) => (
              <div key={r._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{r.productOrModule}</span>
                  <span className="text-slate-500">Expiry: {r.expiryDate} ({r.daysRemaining} days remaining)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">₹{r.contractValue.toLocaleString("en-IN")}</span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "upsell" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-orange-50/70 to-purple-50/50 rounded-xl border border-orange-100">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6600]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Dynamic Account Upsell & Fleet Expansion Matrix
                </h3>
                <span className="text-[10px] font-bold bg-[#FF6600]/10 text-[#FF6600] px-2 py-0.5 rounded-full">
                  {upsells.length} Opportunities
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted recommendations computed dynamically from {customer.companyName}&apos;s installed machinery, active catalog items, and service history.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddUpsell(true)}
              className="px-3.5 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Upsell</span>
            </button>
          </div>

          {upsells.length === 0 ? (
            <div className="py-12 bg-white rounded-xl border border-slate-200 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No active upsell opportunities generated yet.</p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Add products to your organization catalog or click &quot;Add Custom Upsell&quot; to pitch specialized upgrades.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upsells.map((up: any) => (
                <div
                  key={up.sku}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-3 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#FF6600] uppercase tracking-wider">
                        {up.sku}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            up.readiness === "High Interest" || up.readiness === "High Priority"
                              ? "bg-emerald-100 text-emerald-800"
                              : up.readiness === "Due Soon"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {up.readiness}
                        </span>
                        {up.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomUpsell(up.sku)}
                            title="Delete custom upsell"
                            className="text-slate-400 hover:text-red-600 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{up.title}</h4>
                    <p className="text-slate-600 mt-1 leading-relaxed">{up.reason}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Est. Revenue</span>
                      <span className="font-black text-slate-900 text-sm">
                        ₹{(up.estimatedValue || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <Link
                      href={`/quotations/new?company=${encodeURIComponent(customer.companyName)}&customer=${encodeURIComponent(customer.contactPerson || customer.companyName)}&sku=${encodeURIComponent(up.sku)}`}
                      className="px-3 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>Pitch Quote</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Custom Upsell */}
      {showAddUpsell && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#293033] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF6600]" />
                <span>Add Custom Upsell Opportunity</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUpsell(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomUpsell} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opportunity / Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5th Axis High-Speed Rotary Package"
                  value={upsellForm.title}
                  onChange={(e) => setUpsellForm({ ...upsellForm, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UP-5AXIS"
                    value={upsellForm.sku}
                    onChange={(e) => setUpsellForm({ ...upsellForm, sku: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Value (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 350000"
                    value={upsellForm.estimatedValue}
                    onChange={(e) => setUpsellForm({ ...upsellForm, estimatedValue: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Readiness Stage</label>
                <select
                  value={upsellForm.readiness}
                  onChange={(e) => setUpsellForm({ ...upsellForm, readiness: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="High Interest">High Interest</option>
                  <option value="In Evaluation">In Evaluation</option>
                  <option value="Due Soon">Due Soon</option>
                  <option value="Negotiating">Negotiating</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rationale / Strategic Fit *</label>
                <textarea
                  required
                  rows={3}
                  placeholder={`Describe why ${customer.companyName} would benefit from this upgrade...`}
                  value={upsellForm.reason}
                  onChange={(e) => setUpsellForm({ ...upsellForm, reason: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUpsell(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUpsell}
                  className="px-4 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                >
                  {savingUpsell ? "Saving..." : "Save Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
