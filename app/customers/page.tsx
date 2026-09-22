"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { CustomerProfile } from "@/lib/types";
import {
  Building2,
  Search,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Wrench,
  LifeBuoy,
  RefreshCw,
  Coins,
} from "lucide-react";

export default function CustomersPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const url = isHeadOffice
          ? "/api/customers"
          : `/api/customers?franchiseId=${currentUser.franchiseId || "FR-CBE"}`;
        const res = await fetch(url);
        const data = await res.json();
        setCustomers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [currentUser, isHeadOffice]);

  const filtered = customers.filter((c) => {
    return (
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Customer Directory (Customer 360° Repository)
          </h1>
          <p className="text-xs text-slate-500">
            Unified accounts database, machine installation history, lifetime value, and upsell pipelines.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Company, Contact, District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">No customer accounts found.</div>
        ) : (
          filtered.map((cust) => (
            <div
              key={cust._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {cust.customerId}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{cust.companyName}</h3>
                    <p className="text-xs text-slate-500">
                      {cust.contactPerson} ({cust.designation})
                    </p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                    {cust.industry}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Lifetime Value:</span>
                    <span className="font-extrabold text-emerald-700">
                      ₹{cust.lifetimeValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Active Machines on Floor:</span>
                    <span className="font-bold text-slate-900">{cust.activeMachinesCount} units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Open Tickets:</span>
                    <span
                      className={`font-bold ${
                        cust.pendingTicketsCount > 0 ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {cust.pendingTicketsCount} open
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Next AMC Renewal:</span>
                    <span className="font-bold text-slate-800">{cust.nextRenewalDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{cust.district}</span>
                </span>
                <Link
                  href={`/customers/${cust._id}`}
                  className="px-3 py-1.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  <span>Customer 360°</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
