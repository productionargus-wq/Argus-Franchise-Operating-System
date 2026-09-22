"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { ProductMasterItem, QuotationItem } from "@/lib/types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Send,
  Lock,
} from "lucide-react";

function QuotationBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<ProductMasterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote metadata
  const [companyName, setCompanyName] = useState(searchParams.get("company") || "Sri Venkatesh Industries");
  const [customerName, setCustomerName] = useState(searchParams.get("customer") || "Mr. M. Karthik");
  const [opportunityId, setOpportunityId] = useState(searchParams.get("opId") || "OP-1023");

  // Items in quote
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [approvalReason, setApprovalReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);

        // Pre-populate with first product
        if (data.length > 0) {
          const first = data[0];
          const discount = 8;
          const unitPrice = Math.round(first.listPrice * (1 - discount / 100));
          const total = Math.round((unitPrice + first.installationCharge) * 1.18);
          setItems([
            {
              sku: first.sku,
              name: first.name,
              listPrice: first.listPrice,
              minSellingPrice: first.minSellingPrice,
              maxDiscountPercent: first.maxDiscountPercent,
              appliedDiscountPercent: discount,
              unitPrice,
              quantity: 1,
              gstPercent: 18,
              installationCharge: first.installationCharge,
              total,
            },
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const handleAddItem = () => {
    if (products.length === 0) return;
    const prod = products[1] || products[0];
    const discount = 5;
    const unitPrice = Math.round(prod.listPrice * (1 - discount / 100));
    const total = Math.round((unitPrice + prod.installationCharge) * 1.18);

    setItems([
      ...items,
      {
        sku: prod.sku,
        name: prod.name,
        listPrice: prod.listPrice,
        minSellingPrice: prod.minSellingPrice,
        maxDiscountPercent: prod.maxDiscountPercent,
        appliedDiscountPercent: discount,
        unitPrice,
        quantity: 1,
        gstPercent: 18,
        installationCharge: prod.installationCharge,
        total,
      },
    ]);
  };

  const handleProductChange = (index: number, sku: string) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return;

    const newItems = [...items];
    const discount = 5;
    const unitPrice = Math.round(prod.listPrice * (1 - discount / 100));
    const total = Math.round((unitPrice + prod.installationCharge) * 1.18);

    newItems[index] = {
      sku: prod.sku,
      name: prod.name,
      listPrice: prod.listPrice,
      minSellingPrice: prod.minSellingPrice,
      maxDiscountPercent: prod.maxDiscountPercent,
      appliedDiscountPercent: discount,
      unitPrice,
      quantity: 1,
      gstPercent: 18,
      installationCharge: prod.installationCharge,
      total,
    };
    setItems(newItems);
  };

  const handleDiscountChange = (index: number, newDiscount: number) => {
    const newItems = [...items];
    const item = newItems[index];
    item.appliedDiscountPercent = newDiscount;
    item.unitPrice = Math.round(item.listPrice * (1 - newDiscount / 100));
    const sub = item.unitPrice * item.quantity;
    const gst = Math.round(sub * (item.gstPercent / 100));
    item.total = sub + gst + item.installationCharge * item.quantity;
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    const item = newItems[index];
    item.quantity = Math.max(1, qty);
    const sub = item.unitPrice * item.quantity;
    const gst = Math.round(sub * (item.gstPercent / 100));
    item.total = sub + gst + item.installationCharge * item.quantity;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Check whether any item violates Head Office price control limits
  const hasPolicyViolation = items.some(
    (item) =>
      item.appliedDiscountPercent > item.maxDiscountPercent || item.unitPrice < item.minSellingPrice
  );

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const totalDiscount = items.reduce(
    (acc, i) => acc + (i.listPrice - i.unitPrice) * i.quantity,
    0
  );
  const taxAmount = Math.round(subtotal * 0.18);
  const installationTotal = items.reduce(
    (acc, i) => acc + i.installationCharge * i.quantity,
    0
  );
  const grandTotal = subtotal + taxAmount + installationTotal;

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (hasPolicyViolation && !approvalReason.trim()) {
      alert("Commercial justification reason is required when discount exceeds Head Office policy!");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          companyName,
          customerName,
          franchiseId: currentUser.franchiseId || "FR-CBE",
          franchiseName: currentUser.franchiseName || "Coimbatore Franchise",
          createdBy: `${currentUser.name} (${currentUser.role})`,
          items,
          approvalReason: hasPolicyViolation ? approvalReason : undefined,
        }),
      });

      if (res.ok) {
        const quote = await res.json();
        router.push(`/quotations/${quote.quoteId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/quotations"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
              Quotation Builder (Price Control Engine)
            </h1>
            <p className="text-xs text-slate-500">
              Pricing dynamically verified against Head Office price master rules.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitQuotation} className="space-y-6">
        {/* Customer & Opportunity Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Account Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attention (Contact Person) *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opportunity ID</label>
              <input
                type="text"
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {/* Itemized Price Master Builder Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
              Itemized Quotation Lines (Head Office Price Master)
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 rounded-lg bg-orange-50 text-[#FF6600] border border-orange-200 text-xs font-semibold hover:bg-orange-100 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add SKU Line</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-compact">
              <thead>
                <tr>
                  <th>Product / SKU</th>
                  <th>List Price</th>
                  <th>Min Allowed Price</th>
                  <th>Max Disc %</th>
                  <th className="w-28">Applied Disc %</th>
                  <th>Unit Selling Price</th>
                  <th className="w-20">Qty</th>
                  <th>GST (18%)</th>
                  <th>Install Fee</th>
                  <th>Line Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const isExceeded =
                    item.appliedDiscountPercent > item.maxDiscountPercent ||
                    item.unitPrice < item.minSellingPrice;

                  return (
                    <tr
                      key={idx}
                      className={isExceeded ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-slate-50"}
                    >
                      <td>
                        <select
                          value={item.sku}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full text-xs p-1.5 rounded border border-slate-300 font-semibold focus:outline-none focus:border-[#FF6600]"
                        >
                          {products.map((p) => (
                            <option key={p.sku} value={p.sku}>
                              {p.sku} - {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-slate-600">₹{item.listPrice.toLocaleString("en-IN")}</td>
                      <td className="font-bold text-slate-800">
                        ₹{item.minSellingPrice.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded">
                          {item.maxDiscountPercent}%
                        </span>
                      </td>
                      <td>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={item.appliedDiscountPercent}
                            onChange={(e) => handleDiscountChange(idx, Number(e.target.value))}
                            className={`w-full text-xs p-1.5 pr-6 rounded border font-bold ${
                              isExceeded
                                ? "border-red-500 bg-red-50 text-red-700 focus:ring-1 focus:ring-red-500"
                                : "border-slate-300 focus:border-[#FF6600]"
                            }`}
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-slate-400 font-bold">%</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`text-xs font-bold ${
                            isExceeded ? "text-red-700" : "text-slate-900"
                          }`}
                        >
                          ₹{item.unitPrice.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          className="w-full text-xs p-1.5 rounded border border-slate-300 focus:border-[#FF6600]"
                        />
                      </td>
                      <td className="text-slate-600 text-xs">
                        ₹{Math.round(item.unitPrice * item.quantity * 0.18).toLocaleString("en-IN")}
                      </td>
                      <td className="text-slate-600 text-xs">
                        ₹{(item.installationCharge * item.quantity).toLocaleString("en-IN")}
                      </td>
                      <td className="font-black text-slate-900 text-xs">
                        ₹{item.total.toLocaleString("en-IN")}
                      </td>
                      <td className="text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Warning Banner if Discount Exceeds Policy */}
        {hasPolicyViolation ? (
          <div className="p-4 rounded-xl border border-red-300 bg-red-50 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>PRICE CONTROL VIOLATION: Requires Head Office Special Price Approval</span>
            </div>
            <p className="text-xs text-red-700">
              One or more items exceed the maximum permitted discount of 10% or fall below the minimum selling price.
              Franchise users cannot dispatch this quotation directly. You must provide a commercial justification for Head Office authorization.
            </p>
            <div>
              <label className="block text-xs font-bold text-red-900 mb-1">
                Mandatory Discount Justification Reason *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain competitive situation (e.g. Ace Micromatic offering ₹10.8L), customer LTV, or package deal terms..."
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-red-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
              ></textarea>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>All line items conform strictly to Head Office price master and standard discount limits.</span>
          </div>
        )}

        {/* Commercial Totals & Action Buttons */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1 text-xs">
            <div className="text-slate-500">
              Subtotal: <strong className="text-slate-800">₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>
            <div className="text-slate-500">
              Total Discount:{" "}
              <strong className="text-red-600">-₹{totalDiscount.toLocaleString("en-IN")}</strong>
            </div>
            <div className="text-slate-500">
              GST Tax Total (18%):{" "}
              <strong className="text-slate-800">₹{taxAmount.toLocaleString("en-IN")}</strong>
            </div>
            <div className="text-slate-500">
              Installation & Training:{" "}
              <strong className="text-slate-800">₹{installationTotal.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase font-bold">Grand Total (Inc. GST)</span>
              <span className="text-2xl font-black text-[#293033]">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-3 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-2 ${
                hasPolicyViolation
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                  : "bg-[#FF6600] hover:bg-[#E65C00] text-white shadow-orange-200"
              }`}
            >
              {hasPolicyViolation ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting..." : "Send for Special Price Approval"}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Generating..." : "Generate & Send Quotation"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function QuotationBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">Loading quotation engine...</div>
      }
    >
      <QuotationBuilderContent />
    </Suspense>
  );
}
