"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { SupportTicket } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  LifeBuoy,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  Wrench,
  Flame,
  Check,
} from "lucide-react";

export default function SupportTicketDetailPage() {
  const params = useParams();
  const { currentUser } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const loadTicket = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/support/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [params.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !newComment.trim()) return;
    try {
      setSendingComment(true);
      const res = await fetch(`/api/support/${ticket.ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_comment",
          comment: {
            authorName: currentUser.name,
            role: currentUser.role.replace(/_/g, " "),
            message: newComment,
          },
        }),
      });
      if (res.ok) {
        setNewComment("");
        loadTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleUpdateStatus = async (status: SupportTicket["status"]) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/support/${ticket.ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status,
          resolutionNotes: status === "Resolved" ? resolutionNotes || "Spindle IGBT driver replaced and trial cut passed." : undefined,
        }),
      });
      if (res.ok) {
        loadTicket();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-400 text-xs">Loading support ticket...</div>;
  }

  if (!ticket) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600 text-sm font-bold">Ticket not found.</p>
        <Link href="/support" className="text-xs text-[#FF6600] underline font-semibold">
          Return to Tickets
        </Link>
      </div>
    );
  }

  const isCritical = ticket.priority === "Critical";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/support"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#293033] tracking-tight">
                Support Ticket: {ticket.ticketId}
              </h1>
              <StatusBadge status={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <p className="text-xs text-slate-500">{ticket.companyName} | Machine: {ticket.machineSerial}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.status !== "Resolved" && (
            <button
              onClick={() => handleUpdateStatus("Resolved")}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* SLA Alert Banner */}
      {isCritical && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <span className="font-bold text-red-900 text-xs uppercase tracking-wider block">
                CRITICAL BREAKDOWN SLA ACTIVE (4 HOURS TOTAL)
              </span>
              <p className="text-xs text-red-700">
                Machine halted during live client production. Assigned engineer must log on-site diagnosis and upload test report within SLA window.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-red-800 bg-red-100 border border-red-300 px-2.5 py-1 rounded-full whitespace-nowrap">
            Deadline: Today, 13:15
          </span>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Machine & Issue Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3.5 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100">
              Ticket Parameters
            </h3>
            <div>
              <span className="text-slate-400 block text-[11px]">Customer Company</span>
              <span className="font-bold text-slate-900">{ticket.companyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Customer Representative</span>
              <span className="font-semibold text-slate-800">{ticket.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Machine Serial Number</span>
              <span className="font-black text-[#FF6600]">{ticket.machineSerial}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Product Line</span>
              <span className="font-semibold text-slate-800">{ticket.productName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Service Specialist</span>
              <span className="font-semibold text-slate-800">{ticket.assignedEngineerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Ticket Created</span>
              <span className="font-medium text-slate-700">{ticket.createdAt}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100">
              Reported Alarm & Symptoms
            </h3>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
              {ticket.issueDescription}
            </p>
          </div>

          {ticket.resolutionNotes && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 shadow-2xs space-y-2 text-xs">
              <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] block">
                Official Resolution Sign-off
              </span>
              <p className="text-emerald-800">{ticket.resolutionNotes}</p>
              <span className="text-[10px] text-emerald-600 block">Resolved at: {ticket.resolvedAt}</span>
            </div>
          )}
        </div>

        {/* Right: Comments / Engineer Collaboration Thread */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FF6600]" />
                <span>Field Service & Customer Notes Thread</span>
              </h3>
              <span className="text-xs text-slate-400">{ticket.comments.length} message(s)</span>
            </div>

            {/* Conversation Stream */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {ticket.comments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No notes recorded yet. Post an on-site update below.
                </div>
              ) : (
                ticket.comments.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{c.authorName}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          {c.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-0.5">{c.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 space-y-3">
            <textarea
              rows={3}
              required
              placeholder="Log technical diagnostics, parts replaced, voltage readings, or ETA updates..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            ></textarea>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("In Progress")}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                >
                  Set In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Waiting Spares")}
                  className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-800 border border-amber-200"
                >
                  Waiting Spares
                </button>
              </div>

              <button
                type="submit"
                disabled={sendingComment || !newComment.trim()}
                className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingComment ? "Posting..." : "Post Update"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
