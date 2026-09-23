"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { SupportTicket } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  LifeBuoy,
  Search,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Flame,
} from "lucide-react";

export default function SupportPage() {
  const { currentUser, isHeadOffice } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create ticket modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    companyName: "",
    machineSerial: "",
    productName: "",
    category: "Breakdown",
    priority: "Critical",
    issueDescription: "",
  });

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentUser?.orgId) params.set("orgId", currentUser.orgId);
      if (!isHeadOffice && currentUser?.franchiseId) {
        params.set("franchiseId", currentUser.franchiseId);
      }
      const url = `/api/support?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [currentUser, isHeadOffice]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ticketForm,
          orgId: currentUser?.orgId,
          franchiseId: currentUser.franchiseId || "FR-CBE",
          assignedEngineerId: currentUser?.id || "usr-eng",
          assignedEngineerName: currentUser.name || "Service Engineer",
        }),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.companyName.toLowerCase().includes(search.toLowerCase()) ||
      t.machineSerial.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchPriority && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Customer Support Tickets & SLA Response
          </h1>
          <p className="text-xs text-slate-500">
            Real-time breakdown alarms, field engineer dispatch, SLA countdowns, and resolution logging.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Support Ticket</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Ticket ID, Customer, Machine Serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full sm:w-36 text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical (4h SLA)</option>
            <option value="High">High (8h SLA)</option>
            <option value="Medium">Medium (24h SLA)</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-36 text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting Spares">Waiting Spares</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Company / Customer</th>
                <th>Machine Serial & Category</th>
                <th>Priority & SLA</th>
                <th>Assigned Engineer</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading tickets...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => {
                  const isCritical = ticket.priority === "Critical";

                  return (
                    <tr
                      key={ticket._id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCritical ? "bg-red-50/20" : ""
                      }`}
                    >
                      <td className="font-bold text-slate-900 whitespace-nowrap">
                        {ticket.ticketId}
                        {isCritical && (
                          <span className="ml-1.5 inline-flex items-center text-[10px] font-bold text-red-600">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="font-bold text-slate-900">{ticket.companyName}</div>
                        <div className="text-xs text-slate-500">{ticket.customerName}</div>
                      </td>
                      <td>
                        <div className="text-slate-800 font-semibold">{ticket.machineSerial}</div>
                        <div className="text-[11px] text-slate-500">{ticket.category}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={ticket.priority} />
                          <span className="text-[10px] text-slate-500 font-bold">
                            {ticket.slaHoursTotal}h SLA
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs font-semibold text-slate-800">
                          {ticket.assignedEngineerName}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">{ticket.createdAt}</td>
                      <td className="text-right">
                        <Link
                          href={`/support/${ticket.ticketId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-[#FF6600] hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                        >
                          <span>Open Ticket</span>
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

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Raise Support Ticket"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Customer Name *</label>
            <input
              type="text"
              required
              value={ticketForm.companyName}
              onChange={(e) => setTicketForm({ ...ticketForm, companyName: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Machine Serial Number *</label>
              <input
                type="text"
                required
                value={ticketForm.machineSerial}
                onChange={(e) => setTicketForm({ ...ticketForm, machineSerial: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              >
                <option value="Breakdown">Breakdown (Line Stopped)</option>
                <option value="Calibration">Calibration Deviation</option>
                <option value="Software">Software & Controller Alarm</option>
                <option value="Spares">Spare Parts Request</option>
                <option value="General">General Query</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Severity / Priority *</label>
            <select
              value={ticketForm.priority}
              onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-[#FF6600]"
            >
              <option value="Critical">Critical - Production Halted (4h SLA)</option>
              <option value="High">High - Degraded Operation (8h SLA)</option>
              <option value="Medium">Medium - Regular Maintenance (24h SLA)</option>
              <option value="Low">Low - Informational</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alarm Code & Issue Description *</label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Spindle drive error E-04 during roughing pass. Machine shut down."
              value={ticketForm.issueDescription}
              onChange={(e) => setTicketForm({ ...ticketForm, issueDescription: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg shadow-xs"
            >
              Submit Ticket & Start SLA
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
