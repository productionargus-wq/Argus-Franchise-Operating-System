"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
} from "lucide-react";

export default function Customer360Page() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "opportunities" | "quotations" | "orders" | "support" | "renewals" | "upsell"
  >("overview");

  useEffect(() => {
    async function load360() {
      try {
        setLoading(true);
        const res = await fetch(`/api/customers/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load360();
  }, [params.id]);

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
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                    {up.readiness}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{up.title}</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">{up.reason}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Est. Revenue</span>
                  <span className="font-black text-slate-900 text-sm">
                    ₹{up.estimatedValue.toLocaleString("en-IN")}
                  </span>
                </div>

                <Link
                  href={`/quotations/new?company=${encodeURIComponent(customer.companyName)}&customer=${encodeURIComponent(customer.contactPerson)}`}
                  className="px-3 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg transition-colors flex items-center gap-1"
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
  );
}
