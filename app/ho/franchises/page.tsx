"use client";

import React, { useState, useEffect } from "react";
import { Franchise } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Building2,
  Calendar,
  DollarSign,
  Target,
  Users,
  MapPin,
  CheckCircle2,
  FileText,
  Percent,
} from "lucide-react";

export default function FranchisesManagementPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFranchises() {
      try {
        setLoading(true);
        const res = await fetch("/api/franchises");
        const data = await res.json();
        setFranchises(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFranchises();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
          Franchise Partner Network Management
        </h1>
        <p className="text-xs text-slate-500">
          Head Office control over partner agreements, annual targets, territory allocation, collections and commission ledger.
        </p>
      </div>

      {/* Franchises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">Loading franchises...</div>
        ) : (
          franchises.map((fr) => {
            const achievementRate = Math.round((fr.achievedSales / fr.annualTarget) * 100);
            const collectionRate = Math.round((fr.collections / fr.achievedSales) * 100);

            return (
              <div
                key={fr._id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#FF6600] uppercase tracking-wider block">
                      {fr.code}
                    </span>
                    <h2 className="text-base font-black text-slate-900 mt-0.5">{fr.name}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fr.location}</span>
                    </p>
                  </div>
                  <StatusBadge status={fr.status} />
                </div>

                {/* Agreement & Contact */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Partner / MD:</span>
                    <span className="font-bold text-slate-800">{fr.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreement Term:</span>
                    <span className="font-medium text-slate-700">
                      {fr.agreementStartDate} to {fr.agreementEndDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Districts Assigned:</span>
                    <span className="font-semibold text-slate-800">
                      {fr.territoryDistricts.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Performance & Targets */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">Annual Sales Target</span>
                      <span className="font-bold text-slate-900">
                        ₹{(fr.achievedSales / 100000).toFixed(1)} L / ₹{(fr.annualTarget / 100000).toFixed(1)} L
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className="bg-[#FF6600] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, achievementRate)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Achievement Rate: <strong className="text-slate-800">{achievementRate}%</strong></span>
                      <span className="text-emerald-600 font-semibold">On Track</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Collections</span>
                      <span className="font-bold text-slate-900">
                        ₹{(fr.collections / 100000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-slate-500 block">({collectionRate}% of sales)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Commission Paid</span>
                      <span className="font-bold text-emerald-700">
                        ₹{(fr.commissionPaid / 100000).toFixed(2)} L
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Pending: ₹{((fr.commissionEarned - fr.commissionPaid) / 100000).toFixed(2)} L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
