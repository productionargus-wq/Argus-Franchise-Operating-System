"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Lead, Franchise, ProductMasterItem } from "@/lib/types";
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
  Trash2,
  Edit,
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
  const [addModalError, setAddModalError] = useState<string | null>(null);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteRelatedInfo, setDeleteRelatedInfo] = useState<{
    loading: boolean;
    opportunitiesCount: number;
    demosCount: number;
    quotationsCount: number;
    ordersCount: number;
  }>({
    loading: false,
    opportunitiesCount: 0,
    demosCount: 0,
    quotationsCount: 0,
    ordersCount: 0,
  });
  const [franchisesList, setFranchisesList] = useState<Franchise[]>([]);
  const [productsList, setProductsList] = useState<ProductMasterItem[]>([]);

  // Edit lead state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    companyName: "",
    phone: "",
    email: "",
    source: "Exhibition",
    industry: "Auto Components",
    productInterest: "",
    pincode: "",
    district: "",
    franchiseId: "",
    status: "New" as Lead["status"],
    notes: "",
  });

  // New lead form
  const [leadForm, setLeadForm] = useState({
    customerName: "",
    companyName: "",
    phone: "",
    email: "",
    source: "Exhibition",
    industry: "Auto Components",
    productInterest: "",
    pincode: "",
    district: "",
    franchiseId: "",
    notes: "",
  });

  useEffect(() => {
    if (currentUser?.orgId) {
      fetch(`/api/franchises?orgId=${encodeURIComponent(currentUser.orgId)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setFranchisesList(Array.isArray(data) ? data : []))
        .catch((e) => console.error(e));

      fetch(`/api/products?orgId=${encodeURIComponent(currentUser.orgId)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setProductsList(list);
          if (list.length > 0) {
            setLeadForm((prev) => ({
              ...prev,
              productInterest: prev.productInterest && list.some((p) => p.sku === prev.productInterest || p.name === prev.productInterest)
                ? prev.productInterest
                : (list[0].sku || list[0].name || ""),
            }));
          }
        })
        .catch((e) => console.error(e));
    }
  }, [currentUser?.orgId]);

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
    setAddModalError(null);
    setSubmittingLead(true);
    const selectedFr = franchisesList.find((f) => f.code === leadForm.franchiseId);
    const assignedFranchiseId = isHeadOffice ? (leadForm.franchiseId || "") : (currentUser?.franchiseId || "");
    const assignedFranchiseName = isHeadOffice
      ? (selectedFr?.name || "")
      : (currentUser?.franchiseName || "");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          orgId: currentUser?.orgId,
          franchiseId: assignedFranchiseId,
          franchiseName: assignedFranchiseName,
          ownerName: isHeadOffice
            ? (selectedFr?.contactPerson ? `${selectedFr.name} Sales` : currentUser?.name)
            : currentUser?.name,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setLeadForm({
          customerName: "",
          companyName: "",
          phone: "",
          email: "",
          source: "Exhibition",
          industry: "Auto Components",
          productInterest: productsList[0]?.sku || productsList[0]?.name || "",
          pincode: "",
          district: "",
          franchiseId: "",
          notes: "",
        });
        loadLeads();
      } else {
        const data = await res.json();
        setAddModalError(data.error || "Failed to create lead. Please check inputs.");
      }
    } catch (err: any) {
      console.error(err);
      setAddModalError(err.message || "Failed to communicate with server.");
    } finally {
      setSubmittingLead(false);
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

  const handleOpenDeleteModal = async (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
    setDeleteRelatedInfo({
      loading: true,
      opportunitiesCount: lead.status === "Converted" ? 1 : 0,
      demosCount: 0,
      quotationsCount: 0,
      ordersCount: 0,
    });
    if (currentUser?.orgId) {
      try {
        const id = lead._id || lead.leadId;
        const res = await fetch(`/api/leads/${id}?related=true&orgId=${encodeURIComponent(currentUser.orgId)}`);
        if (res.ok) {
          const data = await res.json();
          setDeleteRelatedInfo({
            loading: false,
            opportunitiesCount: data.opportunitiesCount || 0,
            demosCount: data.demosCount || 0,
            quotationsCount: data.quotationsCount || 0,
            ordersCount: data.ordersCount || 0,
          });
        } else {
          setDeleteRelatedInfo((prev) => ({ ...prev, loading: false }));
        }
      } catch {
        setDeleteRelatedInfo((prev) => ({ ...prev, loading: false }));
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete || !currentUser?.orgId) return;
    setDeleting(true);
    try {
      const id = leadToDelete._id || leadToDelete.leadId;
      const res = await fetch(`/api/leads/${id}?orgId=${encodeURIComponent(currentUser.orgId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setLeadToDelete(null);
        loadLeads();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cascade delete lead");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to cascade delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenAddModal = async () => {
    setAddModalError(null);
    if (currentUser?.orgId) {
      try {
        const res = await fetch(`/api/products?orgId=${encodeURIComponent(currentUser.orgId)}`);
        const data = await res.json();
        const list: ProductMasterItem[] = Array.isArray(data) ? data : [];
        setProductsList(list);
        setLeadForm((prev) => {
          const currentValid = prev.productInterest && list.some((p) => p.sku === prev.productInterest || p.name === prev.productInterest);
          return {
            ...prev,
            productInterest: currentValid ? prev.productInterest : (list[0]?.sku || list[0]?.name || ""),
          };
        });
      } catch (err) {
        console.error("Error refreshing products:", err);
      }
    }
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setLeadToEdit(lead);
    setEditForm({
      customerName: lead.customerName || "",
      companyName: lead.companyName || "",
      phone: lead.phone || "",
      email: lead.email || "",
      source: lead.source || "Exhibition",
      industry: lead.industry || "Auto Components",
      productInterest: lead.productInterest || (productsList[0]?.sku || productsList[0]?.name || ""),
      pincode: lead.pincode || "",
      district: lead.district || "",
      franchiseId: lead.franchiseId || "",
      status: (lead.status as Lead["status"]) || "New",
      notes: lead.notes || "",
    });
    setEditModalError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToEdit || !currentUser?.orgId) return;
    setSubmittingEdit(true);
    setEditModalError(null);
    try {
      let assignedFranchiseName = leadToEdit.franchiseName;
      if (editForm.franchiseId) {
        const selectedFr = franchisesList.find((f) => f.code === editForm.franchiseId);
        if (selectedFr) {
          assignedFranchiseName = selectedFr.name;
        }
      }

      const payload: any = {
        ...editForm,
        franchiseName: assignedFranchiseName,
        orgId: currentUser.orgId,
      };

      const targetId = leadToEdit._id || leadToEdit.leadId;
      const res = await fetch(`/api/leads/${targetId}?orgId=${encodeURIComponent(currentUser.orgId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setLeadToEdit(null);
        loadLeads();
      } else {
        const data = await res.json();
        setEditModalError(data.error || "Failed to update lead.");
      }
    } catch (err: any) {
      console.error(err);
      setEditModalError(err.message || "Failed to communicate with server.");
    } finally {
      setSubmittingEdit(false);
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
          onClick={handleOpenAddModal}
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

                        {/* Edit Lead */}
                        <button
                          onClick={() => handleOpenEditModal(lead)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-[#FF6600] transition-colors cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Lead */}
                        <button
                          onClick={() => handleOpenDeleteModal(lead)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          {addModalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center justify-between">
              <span>{addModalError}</span>
              <button
                type="button"
                onClick={() => setAddModalError(null)}
                className="text-red-400 hover:text-red-600 text-xs font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}
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
                placeholder="e.g. Chennai"
                value={leadForm.district}
                onChange={(e) => setLeadForm({ ...leadForm, district: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            {isHeadOffice && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Franchise Partner
                </label>
                <select
                  value={leadForm.franchiseId}
                  onChange={(e) => setLeadForm({ ...leadForm, franchiseId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="">Auto-Route by PIN Code</option>
                  {franchisesList.map((fr) => (
                    <option key={fr.code} value={fr.code}>
                      {fr.name} ({fr.code}) - {fr.location}, {fr.state}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave as &quot;Auto-Route by PIN Code&quot; to automatically assign based on territory boundary rules.
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Product Interest & Requirements
              </label>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Product:</span>
                <select
                  value={leadForm.productInterest}
                  required
                  onChange={(e) => setLeadForm({ ...leadForm, productInterest: e.target.value })}
                  className="text-xs py-1 px-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#FF6600] text-slate-800 font-medium"
                >
                  {productsList.length > 0 ? (
                    productsList.map((p) => {
                      const val = p.sku || p.name;
                      const label = p.sku && p.name && p.sku !== p.name
                        ? `${p.sku} - ${p.name}`
                        : (p.name || p.sku);
                      return (
                        <option key={p._id || p.sku} value={val}>
                          {label}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">No products in catalog</option>
                  )}
                </select>
              </div>
            </div>
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
              disabled={submittingLead}
              className="px-4 py-2 text-xs font-semibold bg-[#FF6600] hover:bg-[#E65C00] disabled:opacity-50 text-white rounded-lg shadow-xs cursor-pointer"
            >
              {submittingLead ? "Creating..." : "Create Lead"}
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

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Lead: ${leadToEdit?.leadId || ""}`}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateLead} className="space-y-4">
          {editModalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{editModalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Precision Engineering Ltd"
                value={editForm.companyName}
                onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senthil Kumar"
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98420 12345"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Lead["status"] })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="In Negotiation">In Negotiation</option>
                <option value="Converted">Converted</option>
                <option value="Disqualified">Disqualified</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
              <select
                value={editForm.source}
                onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
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
                value={editForm.industry}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              >
                <option value="Auto Components">Auto Components</option>
                <option value="Aerospace">Aerospace</option>
                <option value="Tool & Die">Tool & Die</option>
                <option value="General Engg">General Engg</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Interest</label>
              {productsList.length > 0 ? (
                <select
                  value={editForm.productInterest}
                  onChange={(e) => setEditForm({ ...editForm, productInterest: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="">-- Select Product --</option>
                  {productsList.map((p) => {
                    const val = p.sku || p.name;
                    const label = p.sku && p.name && p.sku !== p.name
                      ? `${p.sku} - ${p.name}`
                      : (p.name || p.sku);
                    return (
                      <option key={p._id || p.sku} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Industrial Machine"
                  value={editForm.productInterest}
                  onChange={(e) => setEditForm({ ...editForm, productInterest: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code (Territory Routing)</label>
              <input
                type="text"
                required
                placeholder="e.g. 641001"
                value={editForm.pincode}
                onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                placeholder="e.g. Coimbatore"
                value={editForm.district}
                onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            {isHeadOffice && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Franchise Partner
                </label>
                <select
                  value={editForm.franchiseId}
                  onChange={(e) => setEditForm({ ...editForm, franchiseId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
                >
                  <option value="">Auto-Route by PIN Code</option>
                  {franchisesList.map((fr) => (
                    <option key={fr.code} value={fr.code}>
                      {fr.name} ({fr.code}) - {fr.location}, {fr.state}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Interest & Requirements</label>
            <textarea
              rows={3}
              placeholder="Spindle specifications, part drawing details, expected delivery..."
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingEdit}
              className="px-4 py-2 text-xs font-semibold bg-[#FF6600] hover:bg-[#E65C00] disabled:opacity-50 text-white rounded-lg shadow-xs cursor-pointer"
            >
              {submittingEdit ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Lead Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleting) setIsDeleteModalOpen(false);
        }}
        title="Cascade Delete Lead Confirmation"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-semibold text-red-900 mb-1">
                Warning: Full Cascade Deletion
              </p>
              <p>
                Deleting this lead will permanently delete the lead along with all downstream linked records, pipeline opportunities, scheduled trials/demos, quotations, and associated sales orders.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Lead Reference:</span>
              <span className="font-bold text-slate-900">{leadToDelete?.leadId || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Company Name:</span>
              <span className="font-semibold text-slate-800">{leadToDelete?.companyName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Contact Person:</span>
              <span className="font-medium text-slate-700">{leadToDelete?.customerName} ({leadToDelete?.phone})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Assigned Franchise:</span>
              <span className="font-medium text-slate-700">{leadToDelete?.franchiseName || leadToDelete?.franchiseId || "Unassigned"}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">
              Downstream Cascade Impact Summary:
            </h4>
            {deleteRelatedInfo.loading ? (
              <div className="flex items-center gap-2 p-3 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                <RefreshCw className="w-4 h-4 animate-spin text-[#FF6600]" />
                Scanning database for linked pipeline records...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Opportunities</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {deleteRelatedInfo.opportunitiesCount} records
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Demos & Machine Trials</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {deleteRelatedInfo.demosCount} scheduled
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Quotations & Proposals</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {deleteRelatedInfo.quotationsCount} generated
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Sales Orders & Installs</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {deleteRelatedInfo.ordersCount} downstream
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Please confirm only if you are completely sure. This action is irreversible.
          </p>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting || deleteRelatedInfo.loading}
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {deleting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Cascading Deletion...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Confirm Full Cascade Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
