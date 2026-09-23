"use client";

import React, { useState, useEffect } from "react";
import { Franchise } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { StatusBadge } from "@/components/ui/Badge";
import { OnboardFranchiseModal } from "@/components/franchises/OnboardFranchiseModal";
import { EditFranchiseModal } from "@/components/franchises/EditFranchiseModal";
import { DeleteFranchiseModal } from "@/components/franchises/DeleteFranchiseModal";
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
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  ShieldCheck,
  Pencil,
  Trash2,
} from "lucide-react";

export default function FranchisesManagementPage() {
  const { currentUser } = useAuth();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Edit & Delete state
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingFranchise, setDeletingFranchise] = useState<Franchise | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadFranchises = async () => {
    if (!currentUser?.orgId) {
      setFranchises([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const url = `/api/franchises?orgId=${encodeURIComponent(currentUser.orgId!)}`;
      const res = await fetch(url);
      const data = await res.json();
      setFranchises(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFranchises();
  }, [currentUser?.orgId]);

  const handleFranchiseCreated = () => {
    loadFranchises();
  };

  const handleOpenEdit = (fr: Franchise) => {
    setEditingFranchise(fr);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (fr: Franchise) => {
    setDeletingFranchise(fr);
    setIsDeleteModalOpen(true);
  };

  const handleFranchiseUpdated = (updated: Franchise) => {
    setFranchises((prev) =>
      prev.map((f) => (f._id === updated._id || f.code === updated.code ? updated : f))
    );
  };

  const handleFranchiseDeleted = (franchiseId: string) => {
    setFranchises((prev) =>
      prev.filter((f) => f._id !== franchiseId && f.code !== franchiseId)
    );
  };

  // Filtered franchises
  const filteredFranchises = franchises.filter((fr) => {
    const matchesSearch =
      fr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fr.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fr.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fr.territoryDistricts.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" ? true : fr.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate summary metrics
  const totalTarget = franchises.reduce((acc, f) => acc + (f.annualTarget || 0), 0);
  const totalSales = franchises.reduce((acc, f) => acc + (f.achievedSales || 0), 0);
  const totalCollections = franchises.reduce((acc, f) => acc + (f.collections || 0), 0);
  const activeCount = franchises.filter((f) => f.status === "Active").length;

  return (
    <div className="space-y-6">
      {/* Header with Title and Onboard Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Franchise Partner Network Management
          </h1>
          <p className="text-xs text-slate-500">
            Head Office control over partner agreements, annual targets, territory allocation, collections and commission ledger.
          </p>
        </div>

        <button
          onClick={() => setIsOnboardModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-[#FF6600] hover:bg-[#e05a00] text-white text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Onboard Franchise Partner</span>
        </button>
      </div>

      {/* Network Overview Metric Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Network Size</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6600] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">{franchises.length}</span>
            <span className="text-xs font-semibold text-emerald-600">({activeCount} Active)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Exclusive Authorized Territories</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Consolidated Annual Quota</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">
              ₹{(totalTarget / 10000000).toFixed(2)} Cr
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Target Committed Across Network</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">YTD Sales Achieved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">
              ₹{(totalSales / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-xs font-semibold text-[#FF6600]">
              ({totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Closed Hardware & Software</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-medium">Total Collections</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900">
              ₹{(totalCollections / 10000000).toFixed(2)} Cr
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              ({totalSales > 0 ? Math.round((totalCollections / totalSales) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Bank Reconciled Receipts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, name, city, district, or partner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          {["All", "Active", "Suspended"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#293033] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Franchises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
            Loading franchises...
          </div>
        ) : filteredFranchises.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No franchise partners found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Try adjusting your search query or onboard a new franchise partner.
            </p>
          </div>
        ) : (
          filteredFranchises.map((fr) => {
            const achievementRate = fr.annualTarget > 0 ? Math.round((fr.achievedSales / fr.annualTarget) * 100) : 0;
            const collectionRate = fr.achievedSales > 0 ? Math.round((fr.collections / fr.achievedSales) * 100) : 0;

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
                      <span>{fr.location}, {fr.state}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={fr.status} />
                    <button
                      onClick={() => handleOpenEdit(fr)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#FF6600] transition-colors cursor-pointer"
                      title="Edit Franchise"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(fr)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Franchise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Agreement & Contact */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Partner / MD:</span>
                    <span className="font-bold text-slate-800">{fr.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Details:</span>
                    <span className="font-medium text-slate-700">
                      {fr.phone} • {fr.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreement Term:</span>
                    <span className="font-medium text-slate-700">
                      {fr.agreementStartDate} to {fr.agreementEndDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Districts Assigned:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px] text-right">
                      {fr.territoryDistricts && fr.territoryDistricts.length > 0
                        ? fr.territoryDistricts.join(", ")
                        : "General Territory"}
                    </span>
                  </div>
                  {fr.pincodes && fr.pincodes.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">PIN Codes / Prefixes:</span>
                      <span className="font-medium text-slate-600 font-mono text-[11px] truncate max-w-[200px] text-right">
                        {fr.pincodes.join(", ")}
                      </span>
                    </div>
                  )}
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
                        style={{ width: `${Math.min(100, Math.max(0, achievementRate))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>
                        Achievement Rate: <strong className="text-slate-800">{achievementRate}%</strong>
                      </span>
                      <span className={achievementRate >= 70 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                        {achievementRate >= 70 ? "On Track" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Collections</span>
                      <span className="font-bold text-slate-900">
                        ₹{(fr.collections / 100000).toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({collectionRate}% of sales)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Commission Paid</span>
                      <span className="font-bold text-emerald-700">
                        ₹{(fr.commissionPaid / 100000).toFixed(2)} L
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Pending: ₹{((Math.max(0, fr.commissionEarned - fr.commissionPaid)) / 100000).toFixed(2)} L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Onboard Franchise Modal */}
      <OnboardFranchiseModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onFranchiseCreated={handleFranchiseCreated}
      />

      <EditFranchiseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        franchise={editingFranchise}
        onFranchiseUpdated={handleFranchiseUpdated}
      />

      <DeleteFranchiseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        franchise={deletingFranchise}
        onFranchiseDeleted={handleFranchiseDeleted}
      />
    </div>
  );
}
