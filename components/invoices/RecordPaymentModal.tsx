"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Invoice } from "@/lib/types";
import { IndianRupee, CheckCircle2, AlertCircle } from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentRecorded: (updated: Invoice) => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  if (!invoice) return null;

  const [paymentAmount, setPaymentAmount] = useState<number>(invoice.balanceDue || 0);
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      setError("Please enter a valid payment amount greater than zero.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newAmountPaid = (invoice.amountPaid || 0) + Number(paymentAmount);
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoice.invoiceId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPaid: newAmountPaid,
          orgId: invoice.orgId,
          notes: paymentRef
            ? `${invoice.notes ? invoice.notes + " | " : ""}Payment of ₹${paymentAmount.toLocaleString("en-IN")} recorded (Ref: ${paymentRef})`
            : invoice.notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to record payment");
      }

      const updated = await res.json();
      onPaymentRecorded(updated);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment — ${invoice.invoiceId}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Customer:</span>
            <span className="font-bold text-slate-800">{invoice.companyName}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Grand Total:</span>
            <span className="font-mono font-bold text-slate-900">₹{invoice.grandTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Currently Paid:</span>
            <span className="font-mono text-emerald-700 font-semibold">₹{invoice.amountPaid.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
            <span>Remaining Balance Due:</span>
            <span className="font-mono text-[#FF6600]">₹{invoice.balanceDue.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Payment Amount Received (₹) *
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="number"
              min="1"
              max={invoice.balanceDue}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              required
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Can record full balance or partial milestone remittance.
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Bank Transaction / UTR / Cheque Ref
          </label>
          <input
            type="text"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="e.g. HDFC-RTGS-92847192"
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Record Payment"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
