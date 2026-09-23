"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Quotation } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShoppingCart,
  Send,
  Printer,
} from "lucide-react";

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, canApprovePrice } = useAuth();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  // Approval / Rejection state
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // PO Conversion Modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState(new Date().toISOString().split("T")[0]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const orgParam = currentUser?.orgId ? `?orgId=${encodeURIComponent(currentUser.orgId!)}` : "";
      const res = await fetch(`/api/quotations/${params.id}${orgParam}`);
      if (res.ok) {
        const data = await res.json();
        setQuotation(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuote();
  }, [params.id, currentUser]);

  const handleAuthorize = async (action: "approve" | "reject") => {
    if (!quotation) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/quotations/${quotation.quoteId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          approverName: `${currentUser.name} (Head Office Super Admin)`,
          reason: remarks,
          orgId: currentUser?.orgId,
        }),
      });
      if (res.ok) {
        loadQuote();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotation) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quotation.quoteId,
          poNumber,
          poDate,
          orgId: currentUser?.orgId,
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setIsPoModalOpen(false);
        router.push(`/orders/${order.orderId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading quotation...</div>;
  }

  if (!quotation) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600 text-sm font-bold">Quotation not found.</p>
        <Link href="/quotations" className="text-xs text-[#FF6600] underline font-semibold">
          Return to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/quotations"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#293033] tracking-tight">
                Quotation: {quotation.quoteId} (v{quotation.version})
              </h1>
              <StatusBadge status={quotation.status} />
            </div>
            <p className="text-xs text-slate-500">{quotation.companyName} | Opportunity: {quotation.opportunityId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quotation.status === "Approved" && (
            <button
              onClick={() => {
                setPoNumber(`PO-${Math.floor(10000 + Math.random() * 90000)}`);
                setIsPoModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Convert to Sales Order</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Special Price Approval Banner (If pending authorization) */}
      {quotation.requiresSpecialApproval && quotation.status === "Pending_Approval" && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-900 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>SPECIAL PRICE APPROVAL REQUIRED (DISCOUNT OVERRIDE)</span>
            </div>
            <span className="text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
              Pending HO Decision
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-red-200 text-xs space-y-1">
            <span className="font-bold text-slate-700">Franchise Commercial Justification:</span>
            <p className="text-slate-800 italic">{quotation.approvalReason || "No explanation entered."}</p>
          </div>

          {canApprovePrice ? (
            <div className="pt-2 border-t border-red-200 space-y-3">
              <label className="block text-xs font-bold text-slate-900">
                Head Office Super Admin Decision Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Approved price matching against Ace Micromatic quote. Logged into audit."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-red-500 bg-white"
              />

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAuthorize("reject")}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Reject Special Price</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAuthorize("approve")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Authorize & Approve Override</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Only Head Office Super Admin can authorize this special discount override. Switch role to <strong>Vikram Rathore</strong> in the top bar to review and approve.
            </p>
          )}
        </div>
      )}

      {/* Quotation Specification Document View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <Image
              src="/argus-logo.png"
              alt="ARGUSCNC"
              width={180}
              height={42}
              className="h-10 w-auto object-contain"
              priority
            />
            <p className="text-xs text-slate-500 mt-1">High Performance CNC Machinery & Automation</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold text-slate-900 block text-sm">{quotation.quoteId}</span>
            <span className="text-slate-500">Date: {quotation.createdAt}</span>
            <span className="text-slate-500 block">Valid Until: {quotation.validUntil}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6 border-b border-slate-100 text-xs">
          <div>
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px] mb-1">
              Quotation Issued For:
            </span>
            <div className="font-bold text-slate-900 text-sm">{quotation.companyName}</div>
            <div className="text-slate-600">{quotation.customerName}</div>
          </div>
          <div>
            <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px] mb-1">
              Authorized Franchise Partner:
            </span>
            <div className="font-bold text-slate-900">{quotation.franchiseName}</div>
            <div className="text-slate-600">Franchise Territory: {quotation.franchiseId}</div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="p-6">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Item & SKU</th>
                <th>List Price</th>
                <th>Discount %</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>GST 18%</th>
                <th>Installation</th>
                <th className="text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotation.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-[#FF6600] font-semibold">{item.sku}</div>
                  </td>
                  <td className="text-slate-600">₹{item.listPrice.toLocaleString("en-IN")}</td>
                  <td>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {item.appliedDiscountPercent}%
                    </span>
                  </td>
                  <td className="font-semibold text-slate-900">
                    ₹{item.unitPrice.toLocaleString("en-IN")}
                  </td>
                  <td>{item.quantity}</td>
                  <td className="text-slate-600">
                    ₹{Math.round(item.unitPrice * item.quantity * 0.18).toLocaleString("en-IN")}
                  </td>
                  <td className="text-slate-600">
                    ₹{(item.installationCharge * item.quantity).toLocaleString("en-IN")}
                  </td>
                  <td className="font-bold text-slate-900 text-right">
                    ₹{item.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{quotation.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Total Discount Applied:</span>
                <span className="font-semibold">-₹{quotation.totalDiscount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold">₹{quotation.taxAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Installation & Commissioning:</span>
                <span className="font-semibold">₹{quotation.installationTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-base font-black text-[#293033]">
                <span>Grand Total:</span>
                <span className="text-[#FF6600]">₹{quotation.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log / Price Override History (Section 5 Requirement) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Price Control & Activity Audit Log</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {quotation.auditLogs.map((log, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800">{log.action}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{log.details}</div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <div className="font-medium text-slate-600">{log.user}</div>
                <div>{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Convert to Sales Order Modal */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Convert Quotation to Sales Order (PO Upload)"
        maxWidth="md"
      >
        <form onSubmit={handleConvertToOrder} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-700 block">Quotation Value:</span>
            <span className="text-lg font-black text-emerald-700">
              ₹{quotation.grandTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer PO Number *</label>
            <input
              type="text"
              required
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer PO Date *</label>
            <input
              type="date"
              required
              value={poDate}
              onChange={(e) => setPoDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-900">
            Automated Milestones configured:
            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
              <li>30% Advance on PO Receipt</li>
              <li>60% Prior to Factory Dispatch</li>
              <li>10% Post Customer Sign-off & Commissioning</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPoModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              {actionLoading ? "Converting..." : "Confirm & Generate Sales Order"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
