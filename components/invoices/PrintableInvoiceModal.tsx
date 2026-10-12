"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Invoice } from "@/lib/types";
import { Printer, CheckCircle2, ShieldCheck, Building2, MapPin, ReceiptText } from "lucide-react";

interface PrintableInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function PrintableInvoiceModal({
  isOpen,
  onClose,
  invoice,
}: PrintableInvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Helper to convert numbers to Indian Rupee Words
  const inWords = (num: number) => {
    const a = [
      "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
      "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen ",
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const toWords = (n: number): string => {
      if (n === 0) return "";
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
      if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + toWords(n % 100);
      if (n < 100000) return toWords(Math.floor(n / 1000)) + "Thousand " + toWords(n % 1000);
      if (n < 10000000) return toWords(Math.floor(n / 100000)) + "Lakh " + toWords(n % 100000);
      return toWords(Math.floor(n / 10000000)) + "Crore " + toWords(n % 10000000);
    };

    const words = toWords(Math.floor(num));
    return words ? `${words.trim()} Rupees Only` : "Zero Rupees Only";
  };

  const isProforma = invoice.invoiceType === "Proforma Invoice";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${invoice.invoiceType} — ${invoice.invoiceId}`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isProforma
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              {invoice.invoiceType}
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">
              Status: {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statutory GST Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATUTORY PRINTABLE GST INVOICE LAYOUT */}
        {/* ========================================================================= */}
        <div
          id="statutory-gst-invoice"
          className="bg-white p-6 sm:p-8 border border-slate-300 rounded-xl shadow-xs text-slate-900 font-sans space-y-5 print:border-none print:shadow-none print:p-0"
        >
          {/* Header & Company Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#293033] text-white flex items-center justify-center font-black text-sm tracking-wider">
                  ARG
                </div>
                <h1 className="text-2xl font-black text-[#293033] tracking-tight">
                  ARGUS TECHNOLOGIES
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Industrial CNC Machinery & Automation Operating Systems
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm leading-tight mt-0.5">
                Head Office & Works: SF No. 429/1, Codissia Industrial Park, Peelamedu, Coimbatore - 641014, Tamil Nadu, India.
              </p>
              <p className="text-[11px] text-slate-700 font-semibold mt-1">
                GSTIN: <span className="font-mono">33AABCA8921K1Z2</span> &bull; State Code: 33 (Tamil Nadu)
              </p>
            </div>

            <div className="text-right sm:self-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {isProforma ? "COMMERCIAL DOCUMENT" : "TAX INVOICE (ORIGINAL FOR RECIPIENT)"}
              </span>
              <h2 className="text-xl font-black text-[#FF6600] tracking-tight uppercase">
                {invoice.invoiceType}
              </h2>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                No: {invoice.invoiceId}
              </div>
              <div className="text-[11px] text-slate-500">
                Date: <strong>{invoice.invoiceDate}</strong> &bull; Due: <strong>{invoice.dueDate}</strong>
              </div>
            </div>
          </div>

          {/* Supplier (Franchise) vs Buyer (Customer) 2-Column Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Supplier Information */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Details of Supplier / Franchise Issuer:
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">{invoice.franchiseName}</h4>
              <p className="text-slate-600">
                Authorized Operating Center ({invoice.franchiseId})
              </p>
              <p className="text-slate-600">Place of Supply: <strong>{invoice.placeOfSupply}</strong></p>
              <p className="text-slate-700 font-mono text-[11px]">
                GSTIN: 33AABCA8921K1Z2 (Argus Network Certified)
              </p>
            </div>

            {/* Buyer Information (Billed To & Shipped To) */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Details of Receiver / Billed To:
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">{invoice.companyName}</h4>
              <p className="text-slate-700">Attn: {invoice.customerName}</p>
              <p className="text-slate-600 text-[11px] leading-tight">
                Address: {invoice.billingAddress}
              </p>
              <p className="text-slate-700 font-mono text-[11px]">
                Customer GSTIN: <strong>{invoice.customerGstin || "Unregistered / B2C"}</strong>
              </p>
              {invoice.quotationId && (
                <p className="text-[11px] text-slate-500">
                  Ref Quote: <strong className="text-[#FF6600] font-mono">{invoice.quotationId}</strong>
                  {invoice.orderId && <> &bull; Ref Order: <strong className="font-mono">{invoice.orderId}</strong></>}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Statutory GST Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#293033] text-white text-[11px] uppercase tracking-wider">
                  <th className="p-2.5 rounded-l text-center w-10">#</th>
                  <th className="p-2.5">Description of Goods / Machinery</th>
                  <th className="p-2.5 text-center">HSN/SAC</th>
                  <th className="p-2.5 text-center w-14">Qty</th>
                  <th className="p-2.5 text-right">Unit Rate (Ex-GST)</th>
                  <th className="p-2.5 text-right">Taxable Value</th>
                  <th className="p-2.5 text-right">GST (18%)</th>
                  <th className="p-2.5 rounded-r text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-300">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>
                    </td>
                    <td className="p-2.5 text-center font-mono text-slate-600">{item.hsnCode}</td>
                    <td className="p-2.5 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">
                      ₹{item.unitPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                      ₹{item.taxableAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-600">
                      ₹{(item.total - item.taxableAmount).toLocaleString("en-IN")}
                      <span className="block text-[10px] text-slate-400">CGST 9% + SGST 9%</span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-extrabold text-slate-900">
                      ₹{item.total.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Calculation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Amount in words & Notes */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Total Invoice Amount in Words:
                </span>
                <span className="font-extrabold text-slate-900 italic block mt-0.5">
                  {inWords(invoice.grandTotal)}
                </span>
              </div>

              {/* Bank Remittance Details */}
              <div className="p-3 bg-orange-50/60 rounded-lg border border-orange-200 text-[11px] space-y-1">
                <span className="font-bold text-[#FF6600] uppercase tracking-wider block text-[10px]">
                  Bank Remittance Details (RTGS / NEFT / IMPS):
                </span>
                <div className="grid grid-cols-2 gap-1 text-slate-800">
                  <div>Bank: <strong>{invoice.bankDetails?.bankName || "HDFC Bank Ltd"}</strong></div>
                  <div>Account: <strong className="font-mono">{invoice.bankDetails?.accountNumber || "50200084920194"}</strong></div>
                  <div>IFSC: <strong className="font-mono">{invoice.bankDetails?.ifscCode || "HDFC0001248"}</strong></div>
                  <div>Branch: <strong>{invoice.bankDetails?.branch || "Peelamedu, Coimbatore"}</strong></div>
                </div>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Ex-GST Rate):</span>
                <span className="font-mono font-semibold">₹{invoice.subtotal.toLocaleString("en-IN")}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount Applied:</span>
                  <span className="font-mono font-semibold">-₹{invoice.discountTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1.5">
                <span>Total Taxable Value:</span>
                <span className="font-mono">₹{invoice.taxableAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Central GST (CGST @ 9%):</span>
                <span className="font-mono">₹{Math.round(invoice.taxAmount / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>State GST (SGST @ 9%):</span>
                <span className="font-mono">₹{Math.round(invoice.taxAmount / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                <span>Grand Total (Incl. GST):</span>
                <span className="font-mono text-[#FF6600]">₹{invoice.grandTotal.toLocaleString("en-IN")}</span>
              </div>

              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold text-xs pt-1 border-t border-slate-200">
                  <span>Amount Received / Paid:</span>
                  <span className="font-mono">₹{invoice.amountPaid.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-sm">
                <span>Balance Payable:</span>
                <span className="font-mono text-slate-900">₹{invoice.balanceDue.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Statutory Terms & Signatory Footer */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-500 leading-tight">
            <div>
              <h5 className="font-bold text-slate-700 uppercase mb-1">Standard Terms & Conditions of Sale:</h5>
              <ol className="list-decimal pl-3 space-y-0.5">
                <li>Goods once sold will not be taken back or exchanged.</li>
                <li>Interest @ 18% per annum will be charged on overdue payments after due date.</li>
                <li>Disputes are subject strictly to Coimbatore / Tamil Nadu judicial jurisdiction.</li>
                <li>Standard 12 Months Warranty applies as per Argus Service Level Agreement.</li>
              </ol>
            </div>

            <div className="text-right flex flex-col justify-between items-end h-24">
              <span className="font-bold text-slate-700 uppercase">For ARGUS TECHNOLOGIES:</span>
              <div className="text-right">
                <span className="border-t border-slate-400 pt-1 block text-slate-700 font-bold">
                  Authorized Signatory & Official Stamp
                </span>
                <span className="text-[9px] text-slate-400 block">Digitally verified invoice ledger document</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
