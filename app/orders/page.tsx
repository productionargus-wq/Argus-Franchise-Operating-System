"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { SalesOrder } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  ShoppingCart,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileCheck,
  Truck,
  IndianRupee,
} from "lucide-react";

export default function OrdersPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const url = isHeadOffice
          ? "/api/orders"
          : `/api/orders?franchiseId=${currentUser.franchiseId || "FR-CBE"}`;
        const res = await fetch(url);
        const data = await res.json();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [currentUser, isHeadOffice]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.companyName.toLowerCase().includes(search.toLowerCase()) ||
      o.poNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Sales Orders & Payment Schedules
          </h1>
          <p className="text-xs text-slate-500">
            Track manufacturing stages, factory quality checks, dispatch, and milestone collections.
          </p>
        </div>

        <Link
          href="/quotations"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Convert Approved Quotation →</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order ID, PO Number, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          >
            <option value="ALL">All Stages</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Production/Stock">Production/Stock</option>
            <option value="QC">QC Inspection</option>
            <option value="Dispatch">Dispatched</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Company / Customer</th>
                <th>PO Number & Date</th>
                <th>Order Value</th>
                <th>Milestones Collected</th>
                <th>Fulfillment Stage</th>
                <th>Franchise Territory</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const totalPaid = order.paymentSchedule.reduce(
                    (acc, m) => acc + m.receivedAmount,
                    0
                  );
                  const percentPaid = Math.round((totalPaid / order.orderValue) * 100);

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-bold text-slate-900 whitespace-nowrap">
                        {order.orderId}
                        <span className="text-[10px] text-slate-400 block">{order.quoteId}</span>
                      </td>
                      <td>
                        <div className="font-bold text-slate-900">{order.companyName}</div>
                        <div className="text-xs text-slate-500">{order.customerName}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800">{order.poNumber}</div>
                        <div className="text-[11px] text-slate-400">{order.poDate}</div>
                      </td>
                      <td className="font-black text-slate-900">
                        ₹{order.orderValue.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-700">
                              ₹{totalPaid.toLocaleString("en-IN")}
                            </span>
                            <span className="text-slate-500 font-semibold">{percentPaid}%</span>
                          </div>
                          <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${percentPaid}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="text-xs text-slate-600 font-medium">{order.franchiseName}</td>
                      <td className="text-right">
                        <Link
                          href={`/orders/${order.orderId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#FF6600] hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                        >
                          <span>Track & Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
