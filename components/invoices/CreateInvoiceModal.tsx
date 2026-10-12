"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/AuthContext";
import { Invoice, InvoiceItem, InvoiceType, Quotation, SalesOrder } from "@/lib/types";
import {
  FileText,
  ShoppingCart,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Percent,
  CheckCircle2,
  AlertCircle,
  ReceiptText,
} from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoice: Invoice) => void;
  initialQuotation?: Quotation | null;
  initialOrder?: SalesOrder | null;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
  initialQuotation,
  initialOrder,
}: CreateInvoiceModalProps) {
  const { currentUser, isHeadOffice } = useAuth();

  const [mode, setMode] = useState<"quotation" | "order" | "manual">("manual");
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const [invoiceType, setInvoiceType] = useState<InvoiceType>("Tax Invoice");
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]
  );
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerGstin, setCustomerGstin] = useState("33AAACA1234A1Z5");
  const [billingAddress, setBillingAddress] = useState("Industrial Estate, Sector 4, Chennai, TN");
  const [shippingAddress, setShippingAddress] = useState("Industrial Estate, Sector 4, Chennai, TN");
  const [placeOfSupply, setPlaceOfSupply] = useState("Tamil Nadu (33)");
  const [paymentTerms, setPaymentTerms] = useState("20% Advance, 70% Dispatch, 10% Installation");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState("Statutory GST invoice issued subject to Coimbatore jurisdiction.");
  const [franchiseId, setFranchiseId] = useState("");
  const [franchiseName, setFranchiseName] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      sku: "ARG-CNC-500",
      name: "Argus Pro-500 5-Axis CNC Milling Center",
      hsnCode: "84592990",
      quantity: 1,
      unitPrice: 1200000,
      discountPercent: 0,
      taxableAmount: 1200000,
      gstPercent: 18,
      cgstAmount: 108000,
      sgstAmount: 108000,
      igstAmount: 0,
      total: 1416000,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch available quotations & orders for quick population
  useEffect(() => {
    if (!isOpen || !currentUser?.orgId) return;

    const orgParam = `?orgId=${encodeURIComponent(currentUser.orgId)}`;
    fetch(`/api/quotations${orgParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQuotations(data);
      })
      .catch((e) => console.error("Error loading quotes:", e));

    fetch(`/api/orders${orgParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((e) => console.error("Error loading orders:", e));
  }, [isOpen, currentUser?.orgId]);

  // Handle initialQuotation prop
  useEffect(() => {
    if (initialQuotation && isOpen) {
      setMode("quotation");
      setSelectedQuoteId(initialQuotation.quoteId);
      applyQuotation(initialQuotation);
    } else if (initialOrder && isOpen) {
      setMode("order");
      setSelectedOrderId(initialOrder.orderId);
      applyOrder(initialOrder);
    } else if (isOpen) {
      setFranchiseId(currentUser?.franchiseId || "FR-HO");
      setFranchiseName(currentUser?.franchiseName || (isHeadOffice ? "Argus Head Office" : "Franchise Partner"));
    }
  }, [initialQuotation, initialOrder, isOpen]);

  const applyQuotation = (q: Quotation) => {
    setInvoiceType("Proforma Invoice");
    setCustomerName(q.customerName);
    setCompanyName(q.companyName || q.customerName);
    setCustomerGstin("33AAACA1234A1Z5");
    setBillingAddress(q.customerAddress || "Industrial Estate, Sector 4, Chennai, TN");
    setShippingAddress(q.shippingAddress || q.customerAddress || "Industrial Estate, Sector 4, Chennai, TN");
    setPaymentTerms(q.paymentTerms || "20% Advance, 70% Dispatch, 10% Installation");
    setFranchiseId(q.franchiseId || currentUser?.franchiseId || "FR-HO");
    setFranchiseName(q.franchiseName || "Argus Partner");

    if (q.items && q.items.length > 0) {
      const mapped = q.items.map((it: any) => {
        const qty = it.quantity || 1;
        const rate = it.unitPrice || 0;
        const disc = it.discount || 0;
        const taxable = Math.round(rate * qty * (1 - disc / 100));
        const gst = Math.round(taxable * 0.18);
        return {
          sku: it.sku || "CUSTOM-SKU",
          name: it.productName || it.name || "Industrial Machine Tool",
          hsnCode: "84592990",
          quantity: qty,
          unitPrice: rate,
          discountPercent: disc,
          taxableAmount: taxable,
          gstPercent: 18,
          cgstAmount: Math.round(gst / 2),
          sgstAmount: Math.round(gst / 2),
          igstAmount: 0,
          total: taxable + gst,
        };
      });
      setItems(mapped);
    }
  };

  const applyOrder = (o: SalesOrder) => {
    setInvoiceType("Tax Invoice");
    setCustomerName(o.customerName);
    setCompanyName(o.companyName || o.customerName);
    setCustomerGstin("33AAACA1234A1Z5");
    setBillingAddress(o.deliveryAddress || "Industrial Estate, Sector 4, Chennai, TN");
    setShippingAddress(o.deliveryAddress || "Industrial Estate, Sector 4, Chennai, TN");
    setFranchiseId(o.franchiseId || currentUser?.franchiseId || "FR-HO");
    setFranchiseName(o.franchiseName || "Argus Partner");

    // Pre-fill item from order or base rate
    const val = o.orderValue || o.totalValue || 0;
    const taxable = Math.round(val / 1.18);
    const gst = val - taxable;
    setItems([
      {
        sku: "ARG-PRO-ORD",
        name: `Industrial Equipment — Ref ${o.orderId} (PO ${o.poNumber})`,
        hsnCode: "84592990",
        quantity: 1,
        unitPrice: taxable,
        discountPercent: 0,
        taxableAmount: taxable,
        gstPercent: 18,
        cgstAmount: Math.round(gst / 2),
        sgstAmount: Math.round(gst / 2),
        igstAmount: 0,
        total: val,
      },
    ]);
  };

  const handleQuoteChange = (qId: string) => {
    setSelectedQuoteId(qId);
    const found = quotations.find((q) => q.quoteId === qId);
    if (found) applyQuotation(found);
  };

  const handleOrderChange = (oId: string) => {
    setSelectedOrderId(oId);
    const found = orders.find((o) => o.orderId === oId);
    if (found) applyOrder(found);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.quantity) || 1;
    const rate = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const taxable = Math.round(rate * qty * (1 - disc / 100));
    const gstPercent = Number(item.gstPercent) || 18;
    const gst = Math.round(taxable * (gstPercent / 100));

    item.taxableAmount = taxable;
    item.cgstAmount = Math.round(gst / 2);
    item.sgstAmount = Math.round(gst / 2);
    item.igstAmount = 0;
    item.total = taxable + gst;

    updated[index] = item;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        sku: "SPARE-SKU",
        name: "Standard Spare / Tooling Unit",
        hsnCode: "84592990",
        quantity: 1,
        unitPrice: 50000,
        discountPercent: 0,
        taxableAmount: 50000,
        gstPercent: 18,
        cgstAmount: 4500,
        sgstAmount: 4500,
        igstAmount: 0,
        total: 59000,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
  const taxableAmount = items.reduce((acc, i) => acc + i.taxableAmount, 0);
  const taxAmount = items.reduce((acc, i) => acc + (i.total - i.taxableAmount), 0);
  const grandTotal = taxableAmount + taxAmount;
  const balanceDue = Math.max(0, grandTotal - (Number(amountPaid) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!companyName.trim() || !customerName.trim()) {
      setErrorMessage("Company name and customer contact name are required.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("At least one line item is required.");
      return;
    }

    if (!currentUser?.orgId) {
      setErrorMessage("User organization context is missing.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Invoice> = {
        orgId: currentUser.orgId,
        invoiceType,
        invoiceDate,
        dueDate,
        quotationId: mode === "quotation" ? selectedQuoteId : undefined,
        orderId: mode === "order" ? selectedOrderId : undefined,
        franchiseId: franchiseId || currentUser.franchiseId || "FR-HO",
        franchiseName: franchiseName || (isHeadOffice ? "Argus Head Office" : "Franchise Partner"),
        customerName,
        companyName,
        customerGstin,
        billingAddress,
        shippingAddress,
        placeOfSupply,
        paymentTerms,
        amountPaid: Number(amountPaid) || 0,
        notes,
        items,
      };

      const res = await fetch(`/api/invoices?orgId=${encodeURIComponent(currentUser.orgId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create invoice");
      }

      const created = await res.json();
      onInvoiceCreated(created);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to create invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Legal Customer Invoice"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Source Mode Selector */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Choose Invoice Source / Integration:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("quotation")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mode === "quotation"
                    ? "bg-[#FF6600] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>From Quotation (Proforma)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("order")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mode === "order"
                    ? "bg-[#FF6600] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>From Sales Order (Tax Invoice)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mode === "manual"
                    ? "bg-[#FF6600] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Direct Manual</span>
              </button>
            </div>
          </div>

          {mode === "quotation" && (
            <div className="pt-2 border-t border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Select Approved Quotation to Auto-Fill Items & Customer Details:
              </label>
              <select
                value={selectedQuoteId}
                onChange={(e) => handleQuoteChange(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#FF6600]"
              >
                <option value="">-- Choose Quotation --</option>
                {quotations.map((q) => (
                  <option key={q.quoteId} value={q.quoteId}>
                    {q.quoteId} — {q.companyName} (₹{q.grandTotal?.toLocaleString("en-IN")}) [{q.status}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "order" && (
            <div className="pt-2 border-t border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Select Confirmed Sales Order to Auto-Fill:
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#FF6600]"
              >
                <option value="">-- Choose Sales Order --</option>
                {orders.map((o) => (
                  <option key={o.orderId} value={o.orderId}>
                    {o.orderId} — {o.companyName} (₹{(o.orderValue || o.totalValue || 0).toLocaleString("en-IN")}) [{o.orderStatus}]
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 border border-slate-200 rounded-xl">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Invoice Document Type</label>
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#FF6600]"
            >
              <option value="Tax Invoice">Tax Invoice (Statutory GST)</option>
              <option value="Proforma Invoice">Proforma Invoice (Advance)</option>
              <option value="Milestone Invoice">Milestone Invoice</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Invoice Date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Payment Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Place of Supply</label>
            <input
              type="text"
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              placeholder="e.g. Tamil Nadu (33)"
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>
        </div>

        {/* Customer & Billing Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 border border-slate-200 rounded-xl">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Customer / Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                if (!customerName) setCustomerName(e.target.value);
              }}
              placeholder="e.g. Precision Engineering Works Ltd"
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Contact Person Name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rajesh Kumar (MD)"
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Customer GSTIN</label>
            <input
              type="text"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 33AAACA1234A1Z5"
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 font-mono uppercase focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Billing Address</label>
              <textarea
                rows={2}
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Shipping / Delivery Address</label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Line Items (Statutory HSN & GST Breakdown)
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2 w-24">HSN Code</th>
                  <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-28 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-2 w-16 text-center">Disc %</th>
                  <th className="py-2.5 px-2 w-28 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-2 w-28 text-right">GST (18%)</th>
                  <th className="py-2.5 px-2 w-28 text-right">Total (₹)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const gstVal = item.total - item.taxableAmount;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          placeholder="Item name"
                          className="w-full text-xs py-1 px-2 border border-slate-200 rounded font-medium focus:border-[#FF6600]"
                        />
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          SKU: {item.sku}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) => handleItemChange(idx, "hsnCode", e.target.value)}
                          className="w-full text-xs py-1 px-1.5 border border-slate-200 rounded font-mono text-center focus:border-[#FF6600]"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                          className="w-full text-xs py-1 px-1.5 border border-slate-200 rounded text-center focus:border-[#FF6600]"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                          className="w-full text-xs py-1 px-1.5 border border-slate-200 rounded text-right font-mono focus:border-[#FF6600]"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent || 0}
                          onChange={(e) => handleItemChange(idx, "discountPercent", Number(e.target.value))}
                          className="w-full text-xs py-1 px-1 border border-slate-200 rounded text-center focus:border-[#FF6600]"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-semibold font-mono text-slate-700">
                        ₹{item.taxableAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-500">
                        ₹{gstVal.toLocaleString("en-IN")}
                        <span className="block text-[10px] text-slate-400 font-sans">
                          (9% CGST + 9% SGST)
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-bold font-mono text-slate-900">
                        ₹{item.total.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-1/2 space-y-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full text-xs py-1 px-2 border border-slate-200 rounded focus:border-[#FF6600]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Advance / Initial Paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  placeholder="0"
                  className="w-48 text-xs py-1 px-2 border border-slate-200 rounded font-mono focus:border-[#FF6600]"
                />
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Taxable Value:</span>
                <span className="font-semibold font-mono">₹{taxableAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Output CGST (9%):</span>
                <span className="font-mono">₹{Math.round(taxAmount / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Output SGST (9%):</span>
                <span className="font-mono">₹{Math.round(taxAmount / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-300 text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-[#FF6600]">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              {amountPaid > 0 && (
                <div className="flex justify-between text-xs pt-1 border-t border-dashed border-slate-200">
                  <span className="text-emerald-700 font-bold">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{amountPaid.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Balance Payable:</span>
                <span className="font-mono">₹{balanceDue.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-[#FF6600] hover:bg-[#e65c00] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ReceiptText className="w-4 h-4" />
            <span>{submitting ? "Issuing Invoice..." : `Generate ${invoiceType}`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
