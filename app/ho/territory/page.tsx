"use client";

import React, { useState, useEffect } from "react";
import { TerritoryMapping } from "@/lib/types";
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function TerritoryManagementPage() {
  const [territories, setTerritories] = useState<TerritoryMapping[]>([]);
  const [loading, setLoading] = useState(true);

  // Test PIN code conflict simulator
  const [testPincode, setTestPincode] = useState("641601");
  const [testFranchise, setTestFranchise] = useState("FR-CBE");
  const [conflictResult, setConflictResult] = useState<any>(null);

  useEffect(() => {
    async function loadTerritories() {
      try {
        setLoading(true);
        const res = await fetch("/api/territories");
        const data = await res.json();
        setTerritories(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTerritories();
  }, []);

  const handleTestConflict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/territories?pincode=${testPincode}&franchiseId=${testFranchise}`);
      const data = await res.json();
      setConflictResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
          Territory Mapping & Conflict Detection Engine
        </h1>
        <p className="text-xs text-slate-500">
          Hierarchical Country &gt; State &gt; District/City &gt; Postal PIN Code mapping with exclusivity protection.
        </p>
      </div>

      {/* Interactive Conflict Testing Sandbox */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#FF6600]" />
            <span>Interactive Territory & Protected Zone Routing Sandbox</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how leads with specific postal PIN codes are validated during data entry.
          </p>
        </div>

        <form onSubmit={handleTestConflict} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Postal PIN Code</label>
            <input
              type="text"
              value={testPincode}
              onChange={(e) => setTestPincode(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Originating Franchise</label>
            <select
              value={testFranchise}
              onChange={(e) => setTestFranchise(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            >
              <option value="FR-CBE">Coimbatore Franchise (FR-CBE)</option>
              <option value="FR-CHE">Chennai Franchise (FR-CHE)</option>
              <option value="FR-BLR">Bangalore Franchise (FR-BLR)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Simulate Conflict Check</span>
            </button>
          </div>
        </form>

        {conflictResult && (
          <div
            className={`p-4 rounded-xl border text-xs animate-fadeIn ${
              conflictResult.hasConflict
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-emerald-50 border-emerald-300 text-emerald-900"
            }`}
          >
            {conflictResult.hasConflict ? (
              <div className="space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Territory Boundary Conflict Detected!</span>
                </span>
                <p>
                  PIN Code <strong>{testPincode}</strong> falls inside territory assigned to{" "}
                  <strong>{conflictResult.assignedTo}</strong> ({conflictResult.district},{" "}
                  {conflictResult.state}).
                </p>
                <p className="text-[11px] text-amber-700">
                  Lead will be automatically flagged with a &quot;Territory Conflict&quot; badge and routed to Head
                  Office Super Admin for boundary dispensation.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  Authorized territory. PIN Code <strong>{testPincode}</strong> is valid and assigned to this
                  franchise.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Territory Mappings Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
            Active Territory Master Table (Country &gt; State &gt; District &gt; PINs)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Country & State</th>
                <th>District / City</th>
                <th>Mapped Franchise</th>
                <th>PIN Code Ranges</th>
                <th>Protected Exclusivity</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Loading territory data...
                  </td>
                </tr>
              ) : (
                territories.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <div className="font-bold text-slate-900">{t.state}</div>
                      <div className="text-xs text-slate-400">{t.country}</div>
                    </td>
                    <td className="font-bold text-slate-800">{t.district}</td>
                    <td>
                      <div className="font-semibold text-slate-900">{t.assignedFranchiseName}</div>
                      <div className="text-[11px] text-[#FF6600]">{t.assignedFranchiseId}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {t.pincodeRange.map((pin) => (
                          <span
                            key={pin}
                            className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded"
                          >
                            {pin}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {t.isProtected ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Protected Zone</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Shared / Open Boundary</span>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
