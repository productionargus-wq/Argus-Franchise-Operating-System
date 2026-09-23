"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { SalesOrder, PaymentMilestone } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck,
  Wrench,
  DollarSign,
  Plus,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment recording modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<PaymentMilestone | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const stages: SalesOrder["orderStatus"][] = [
    "Confirmed",
    "Production/Stock",
    "QC",
    "Dispatch",
    "Delivered",
  ];

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orgParam = currentUser?.orgId ? `?orgId=${encodeURIComponent(currentUser.orgId!)}` : "";
      const res = await fetch(`/api/orders/${params.id}${orgParam}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id, currentUser]);

  const handleUpdateStatus = async (newStatus: SalesOrder["orderStatus"]) => {
    if (!order) return;
    try {
      const res = await fetch(`/api/orders/${order.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", orderStatus: newStatus, orgId: currentUser?.orgId }),
      });
      if (res.ok) {
        loadOrder();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !selectedMilestone) return;
    try {
      setSubmittingPayment(true);
      const res = await fetch(`/api/orders/${order.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          milestoneName: selectedMilestone.milestoneName,
          amount: paymentAmount,
          ref: paymentRef,
          orgId: currentUser?.orgId,
        }),
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        loadOrder();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading sales order details...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600 text-sm font-bold">Order not found.</p>
        <Link href="/orders" className="text-xs text-[#FF6600] underline font-semibold">
          Return to Orders
        </Link>
      </div>
    );
  }

  const currentStageIdx = stages.indexOf(order.orderStatus);
  const totalPaid = order.paymentSchedule.reduce((acc, m) => acc + m.receivedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#293033] tracking-tight">
                Sales Order: {order.orderId}
              </h1>
              <StatusBadge status={order.orderStatus} />
            </div>
            <p className="text-xs text-slate-500">
              {order.companyName} | Ref Quote: {order.quoteId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/installations"
            className="px-3.5 py-2 bg-[#293033] hover:bg-[#FF6600] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Installation & Sign-off →</span>
          </Link>
        </div>
      </div>

      {/* Fulfillment Stage Tracker (Matching Mockup Screen 6) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfillment & Delivery Tracker</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {stages.map((stg, idx) => {
            const isCompleted = currentStageIdx >= idx;
            const isCurrent = currentStageIdx === idx;

            return (
              <button
                key={stg}
                onClick={() => handleUpdateStatus(stg)}
                className={`p-3 rounded-lg border text-xs font-bold text-center transition-all flex flex-col items-center gap-1.5 ${
                  isCurrent
                    ? "bg-[#FF6600] text-white border-[#FF6600] shadow-xs"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCurrent ? "bg-white text-[#FF6600]" : isCompleted ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span>{stg}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PO Overview & Commercial Values */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Customer PO #</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">{order.poNumber}</span>
          <span className="text-xs text-slate-500 mt-1 block">Date: {order.poDate}</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order Contract Value</span>
          <span className="text-base font-black text-slate-900 mt-0.5 block">
            ₹{order.orderValue.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Includes 18% GST & Install</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Total Received</span>
          <span className="text-base font-black text-emerald-800 mt-0.5 block">
            ₹{totalPaid.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-emerald-600 mt-1 block">
            {Math.round((totalPaid / order.orderValue) * 100)}% Collected
          </span>
        </div>

        <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50">
          <span className="text-[11px] font-bold text-[#FF6600] uppercase tracking-wider block">Outstanding Balance</span>
          <span className="text-base font-black text-[#FF6600] mt-0.5 block">
            ₹{(order.orderValue - totalPaid).toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Post install milestone</span>
        </div>
      </div>

      {/* Payment Schedule & Milestones (Section 3.6 & Mockup Screen 6) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
              Payment Schedule & Milestone Tracking
            </h3>
            <p className="text-xs text-slate-400">
              Payments trigger commission eligibility calculations automatically upon bank receipt.
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {order.paymentSchedule.map((milestone, idx) => {
            const isPaid = milestone.status === "Received";

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isPaid ? "bg-emerald-50/40 border-emerald-300" : "bg-white border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{milestone.milestoneName}</span>
                    <StatusBadge status={milestone.status} />
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-2">
                    ₹{milestone.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {milestone.percentage}% of order value | Due: {milestone.dueDate}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs">
                  {isPaid ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Received ₹{milestone.receivedAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Ref: {milestone.referenceNumber} on {milestone.receivedDate}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedMilestone(milestone);
                        setPaymentAmount(milestone.amount);
                        setPaymentRef(`UTR-HDFC-${Math.floor(100000 + Math.random() * 900000)}`);
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Payment Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment Receipt: ${selectedMilestone?.milestoneName}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Received Amount (₹) *</label>
            <input
              type="number"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-sm focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Bank Reference / UTR Number *
            </label>
            <input
              type="text"
              required
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <strong>Commission Automation:</strong> Marking payment received moves eligible revenue into the franchise commission ledger automatically.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPayment}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
            >
              {submittingPayment ? "Saving..." : "Confirm Payment Receipt"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
