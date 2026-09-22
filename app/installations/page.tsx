"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { Installation } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Wrench,
  Search,
  ArrowRight,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function InstallationsPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadInstallations() {
      try {
        setLoading(true);
        const url = isHeadOffice
          ? "/api/installations"
          : `/api/installations?franchiseId=${currentUser.franchiseId || "FR-CBE"}`;
        const res = await fetch(url);
        const data = await res.json();
        setInstallations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadInstallations();
  }, [currentUser, isHeadOffice]);

  const filtered = installations.filter((i) => {
    const matchSearch =
      i.installationId.toLowerCase().includes(search.toLowerCase()) ||
      i.companyName.toLowerCase().includes(search.toLowerCase()) ||
      i.machineSerial.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Machine Installation & Operator Training
          </h1>
          <p className="text-xs text-slate-500">
            Field service engineer checklists, photo verification, training completion, and digital customer acceptance.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Installation ID, Serial #, Customer..."
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
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Sign-off">Pending Sign-off</option>
            <option value="Completed">Completed & Signed</option>
          </select>
        </div>
      </div>

      {/* Installations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">Loading installations...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">No installations found.</div>
        ) : (
          filtered.map((inst) => {
            const checklistItems = [
              inst.checklist.materialDelivered,
              inst.checklist.preInstallCheck,
              inst.checklist.machineInstalled,
              inst.checklist.trainingCompleted,
              inst.checklist.customerSignOff,
            ];
            const completedCount = checklistItems.filter(Boolean).length;
            const progressPercent = Math.round((completedCount / 5) * 100);

            return (
              <div
                key={inst._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#FF6600] uppercase tracking-wider">
                        {inst.installationId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{inst.companyName}</h3>
                      <p className="text-xs text-slate-500">Machine Serial: <strong className="text-slate-800">{inst.machineSerial}</strong></p>
                    </div>
                    <StatusBadge status={inst.status} />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Engineer:</span>
                      <span className="font-semibold text-slate-800">{inst.assignedEngineerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Scheduled Date:</span>
                      <span className="font-semibold text-slate-800">{inst.scheduledDate}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Checklist Progress:</span>
                        <span className="font-extrabold text-[#FF6600]">{completedCount} of 5 Completed</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#FF6600] h-full rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Order Ref: {inst.orderId}</span>
                  <Link
                    href={`/installations/${inst.installationId}`}
                    className="px-3.5 py-1.5 bg-[#293033] hover:bg-[#FF6600] text-white font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs"
                  >
                    <span>Execute Checklist & Sign-off</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
