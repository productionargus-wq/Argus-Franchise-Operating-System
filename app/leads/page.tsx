"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Lead } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  ArrowRightCircle,
  AlertTriangle,
  UserCheck,
  Building,
  RefreshCw,
} from "lucide-react";

export default function LeadsPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [industryFilter, setIndustryFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  // New lead form
  const [leadForm, setLeadForm] = useState({
    customerName: "",
    companyName: "",
    phone: "",
    email: "",
    source: "Exhibition",
    industry: "Auto Components",
    productInterest: "ARG-VMC-700",
    pincode: "641001",
    district: "Coimbatore",
    notes: "",
  });

  const loadLeads = async () => {
    if (!currentUser?.orgId) {
      setLeads([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("orgId", currentUser.orgId!);
      if (!isHeadOffice && currentUser?.franchiseId) params.set("franchiseId", currentUser.franchiseId);
      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [currentUser?.orgId, currentUser?.franchiseId, isHeadOffice]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          orgId: currentUser?.orgId,
          franchiseId: currentUser?.franchiseId || "",
          franchiseName: currentUser?.franchiseName || "",
          ownerName: currentUser?.name,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      const orgParam = currentUser?.orgId ? `?orgId=${currentUser.orgId}` : "";
      const res = await fetch(`/api/leads/${leadId}/convert${orgParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: currentUser?.orgId }),
      });
      if (res.ok) {
        const op = await res.json();
        router.push(`/opportunities/${op.opportunityId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQualifyLead = async (leadId: string) => {
    try {
      const orgParam = currentUser?.orgId ? `?orgId=${currentUser.orgId}` : "";
      const res = await fetch(`/api/leads/${leadId}${orgParam}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Qualified", orgId: currentUser?.orgId }),
      });
      if (res.ok) {
        loadLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!selectedLead || !followUpDate) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextFollowUpDate: followUpDate }),
      });
      if (res.ok) {
        setIsFollowUpModalOpen(false);
        loadLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.customerName.toLowerCase().includes(search.toLowerCase()) ||
      l.leadId.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
    const matchSource = sourceFilter === "ALL" || l.source === sourceFilter;
    const matchIndustry = industryFilter === "ALL" || l.industry === industryFilter;

    return matchSearch && matchStatus && matchSource && matchIndustry;
  });

  return (
    <div className="space-y-5">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">Lead Management</h1>
          <p className="text-xs text-slate-500">
            {isHeadOffice
              ? "Multi-franchise lead pipeline, conflict monitoring and territory allocation"
              : `Sales prospects for ${currentUser.franchiseName || "Coimbatore Franchise"}`}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Lead ID, Company, or Contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            >
              <option value="ALL">All Statuses</option>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="In Progress">In Progress</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            >
              <option value="ALL">All Sources</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Direct Call">Direct Call</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            >
              <option value="ALL">All Industries</option>
              <option value="Auto Components">Auto Components</option>
              <option value="Aerospace">Aerospace</option>
              <option value="Tool & Die">Tool & Die</option>
              <option value="General Engg">General Engg</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing <strong>{filteredLeads.length}</strong> leads</span>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setSourceFilter("ALL");
              setIndustryFilter("ALL");
            }}
            className="text-[#FF6600] hover:underline flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Company & Customer</th>
                <th>Industry & Territory</th>
                <th>Source</th>
                <th>Product Interest</th>
                <th>Owner / Franchise</th>
                <th>Status</th>
                <th>Next Follow-up</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-bold text-slate-900 whitespace-nowrap">
                      {lead.leadId}
                      {lead.territoryConflict && (
                        <span
                          className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded"
                          title={lead.conflictNotes || "Territory Conflict"}
                        >
                          <AlertTriangle className="w-3 h-3" /> Conflict
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{lead.companyName}</div>
                      <div className="text-xs text-slate-500">{lead.customerName}</div>
                    </td>
                    <td>
                      <div className="text-slate-800 font-medium">{lead.industry}</div>
                      <div className="text-[11px] text-slate-400">
                        {lead.district}, PIN: {lead.pincode}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {lead.source}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-[#FF6600]">{lead.productInterest}</span>
                    </td>
                    <td>
                      <div className="text-xs font-medium text-slate-800">{lead.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{lead.franchiseName}</div>
                    </td>
                    <td>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{lead.nextFollowUpDate || "Not set"}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {/* Qualify Action */}
                        {lead.status === "New" && (
                          <button
                            onClick={() => handleQualifyLead(lead._id)}
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Qualify Lead"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Convert to Opportunity */}
                        {lead.status !== "Converted" && (
                          <button
                            onClick={() => handleConvertLead(lead._id)}
                            className="p-1.5 rounded hover:bg-purple-50 text-purple-600 transition-colors"
                            title="Convert to Opportunity"
                          >
                            <ArrowRightCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Schedule Follow-up */}
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setFollowUpDate(lead.nextFollowUpDate || "");
                            setIsFollowUpModalOpen(true);
                          }}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Schedule Follow-up"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>

                        {/* Quick Contact buttons */}
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                          title={`Call ${lead.phone}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                          title={`Email ${lead.email}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Lead" maxWidth="lg">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Precision Tools"
                value={leadForm.companyName}
                onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senthil Kumar"
                value={leadForm.customerName}
                onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98420 12345"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
              <select
                value={leadForm.source}
                onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              >
                <option value="Exhibition">Exhibition</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Direct Call">Direct Call</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
              <select
                value={leadForm.industry}
                onChange={(e) => setLeadForm({ ...leadForm, industry: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              >
                <option value="Auto Components">Auto Components</option>
                <option value="Aerospace">Aerospace</option>
                <option value="Tool & Die">Tool & Die</option>
                <option value="General Engg">General Engg</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code (Automated Territory Routing)</label>
              <input
                type="text"
                required
                placeholder="e.g. 641001"
                value={leadForm.pincode}
                onChange={(e) => setLeadForm({ ...leadForm, pincode: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={leadForm.district}
                onChange={(e) => setLeadForm({ ...leadForm, district: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Machine Interest & Requirements</label>
            <textarea
              rows={3}
              placeholder="Spindle specifications, part drawing details, expected delivery..."
              value={leadForm.notes}
              onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-lg shadow-xs"
            >
              Create Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title={`Schedule Follow-up: ${selectedLead?.companyName}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Set the next scheduled touchpoint date for contact with <strong>{selectedLead?.customerName}</strong>.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsFollowUpModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleFollowUp}
              className="px-4 py-2 text-xs font-semibold bg-[#FF6600] hover:bg-[#E65C00] text-white rounded-lg"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
