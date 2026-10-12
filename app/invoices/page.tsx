"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Invoice, InvoiceType, InvoiceStatus } from "@/lib/types";
import { PrintableInvoiceModal } from "@/components/invoices/PrintableInvoiceModal";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";
import { RecordPaymentModal } from "@/components/invoices/RecordPaymentModal";
import { Modal } from "@/components/ui/Modal";
import {
  ReceiptText,
  Search,
  Plus,
  Printer,
  CreditCard,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Building2,
  FileText,
  ShoppingCart,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function InvoicesPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInvoices = async () => {
    if (!currentUser?.orgId) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("orgId", currentUser.orgId);
      if (!isHeadOffice && currentUser?.franchiseId) {
        params.set("franchiseId", currentUser.franchiseId);
      }
      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentUser?.orgId, currentUser?.franchiseId, isHeadOffice]);

  const handleDelete = async () => {
    if (!deleteTarget || !currentUser?.orgId) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/invoices/${encodeURIComponent(deleteTarget.invoiceId)}?orgId=${encodeURIComponent(
          currentUser.orgId
        )}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setInvoices((prev) => prev.filter((i) => i.invoiceId !== deleteTarget.invoiceId));
        setDeleteTarget(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete invoice");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to delete invoice");
    } finally {
      setDeleting(false);
    }
  };

  const handleInvoiceCreated = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);
    // Automatically open printable modal for instant preview
    setPrintableInvoice(newInv);
  };

  const handlePaymentRecorded = (updatedInv: Invoice) => {
    setInvoices((prev) =>
      prev.map((i) => (i.invoiceId === updatedInv.invoiceId ? updatedInv : i))
    );
  };

  // Filtered invoices
  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      inv.invoiceId.toLowerCase().includes(q) ||
      inv.companyName.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      (inv.quotationId && inv.quotationId.toLowerCase().includes(q)) ||
      (inv.orderId && inv.orderId.toLowerCase().includes(q));

    const matchType = typeFilter === "ALL" || inv.invoiceType === typeFilter;
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // KPI calculations
  const totalInvoiced = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
  const totalCollections = invoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const outstandingDue = invoices.reduce((acc, i) => acc + (i.balanceDue || 0), 0);
  const overdueCount = invoices.filter((i) => {
    if (i.balanceDue <= 0 || i.status === "Paid") return false;
    return new Date(i.dueDate) < new Date();
  }).length;
  const realizationPercent = totalInvoiced > 0 ? Math.round((totalCollections / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FF6600]/10 rounded-lg text-[#FF6600]">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
              Invoices & Customer Billing
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Issue legal GST Tax Invoices, Proforma Invoices for advance payments, and track milestone receivables.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchInvoices()}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Refresh Invoices"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#FF6600] hover:bg-[#e65c00] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Invoiced</span>
            <ReceiptText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            ₹{totalInvoiced.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {invoices.length} invoices issued to date
          </div>
        </div>

        {/* Collections Realized */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Collections Realized</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-700 font-mono">
            ₹{totalCollections.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Recovery Ratio</span>
            <span className="font-bold text-emerald-600">{realizationPercent}%</span>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Receivables</span>
            <IndianRupee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 font-mono">
            ₹{outstandingDue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Awaiting customer payment release
          </div>
        </div>

        {/* Overdue / Critical */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-red-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Invoices</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-600 font-mono">
            {overdueCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Past due date requiring follow-up
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Invoice #, Company, Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#FF6600]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Issued">Issued</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          {[
            { label: "All Invoices", val: "ALL" },
            { label: "Tax Invoices", val: "Tax Invoice" },
            { label: "Proforma Invoices", val: "Proforma Invoice" },
            { label: "Milestone Invoices", val: "Milestone Invoice" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setTypeFilter(tab.val)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                typeFilter === tab.val
                  ? "bg-[#293033] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice # & Type</th>
                <th className="py-3 px-4">Customer / Company</th>
                <th className="py-3 px-3">Linked Ref</th>
                <th className="py-3 px-3">Invoice / Due Date</th>
                <th className="py-3 px-4 text-right">Invoice Value</th>
                <th className="py-3 px-4 text-right">Paid / Balance Due</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FF6600]" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <ReceiptText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No invoices found matching criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click &ldquo;Generate New Invoice&rdquo; above or convert directly from an approved quotation or sales order.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const isOverdue =
                    inv.balanceDue > 0 &&
                    inv.status !== "Paid" &&
                    new Date(inv.dueDate) < new Date();
                  const percentPaid =
                    inv.grandTotal > 0
                      ? Math.min(100, Math.round(((inv.amountPaid || 0) / inv.grandTotal) * 100))
                      : 0;

                  return (
                    <tr key={inv._id || inv.invoiceId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Invoice ID & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 font-mono flex items-center gap-1.5">
                          <span>{inv.invoiceId}</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.invoiceType === "Proforma Invoice"
                                ? "bg-blue-100 text-blue-700"
                                : inv.invoiceType === "Milestone Invoice"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {inv.invoiceType}
                          </span>
                        </div>
                      </td>

                      {/* Customer / Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.companyName}</div>
                        <div className="text-[11px] text-slate-500">{inv.customerName}</div>
                        {inv.customerGstin && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            GSTIN: {inv.customerGstin}
                          </div>
                        )}
                      </td>

                      {/* Linked Reference */}
                      <td className="py-3.5 px-3">
                        {inv.quotationId && (
                          <Link
                            href={`/quotations/${encodeURIComponent(inv.quotationId)}`}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <FileText className="w-3 h-3" />
                            <span>{inv.quotationId}</span>
                          </Link>
                        )}
                        {inv.orderId && (
                          <Link
                            href={`/orders/${encodeURIComponent(inv.orderId)}`}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold block mt-0.5"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>{inv.orderId}</span>
                          </Link>
                        )}
                        {!inv.quotationId && !inv.orderId && (
                          <span className="text-[11px] text-slate-400">Direct Invoice</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-700">{inv.invoiceDate}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isOverdue ? "text-red-600 font-bold" : "text-slate-400"
                          }`}
                        >
                          Due: {inv.dueDate} {isOverdue && "(OVERDUE)"}
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 text-right font-black font-mono text-slate-900 text-sm">
                        ₹{inv.grandTotal.toLocaleString("en-IN")}
                      </td>

                      {/* Paid & Balance Due */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold font-mono text-emerald-700">
                          ₹{inv.amountPaid.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          Due: ₹{inv.balanceDue.toLocaleString("en-IN")}
                        </div>
                        <div className="w-24 ml-auto bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentPaid === 100 ? "bg-emerald-500" : "bg-[#FF6600]"
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            inv.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "Partially Paid"
                              ? "bg-amber-100 text-amber-800"
                              : isOverdue
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isOverdue && inv.status !== "Paid" ? "Overdue" : inv.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print / View Modal */}
                          <button
                            type="button"
                            onClick={() => setPrintableInvoice(inv)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="View Statutory GST Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Record Payment */}
                          {inv.balanceDue > 0 && (
                            <button
                              type="button"
                              onClick={() => setPaymentInvoice(inv)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Record Customer Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(inv)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      <PrintableInvoiceModal
        isOpen={!!printableInvoice}
        onClose={() => setPrintableInvoice(null)}
        invoice={printableInvoice}
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
        onPaymentRecorded={handlePaymentRecorded}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={`Delete Invoice ${deleteTarget.invoiceId}?`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete invoice{" "}
              <strong className="text-slate-900">{deleteTarget.invoiceId}</strong> for{" "}
              <strong>{deleteTarget.companyName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
