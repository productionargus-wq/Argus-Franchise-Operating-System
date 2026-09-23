"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { UserSession, Franchise } from "@/lib/types";
import {
  Users,
  Shield,
  Building2,
  CheckCircle2,
  Lock,
  Sparkles,
  UserPlus,
  X,
  Mail,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export default function UsersAndRolesPage() {
  const { currentUser, switchRole, availableUsers, registerNewUser, organization } = useAuth();

  const [usersList, setUsersList] = useState<UserSession[]>(availableUsers);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Personnel Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserSession["role"]>("franchise_admin");
  const [newFranchiseId, setNewFranchiseId] = useState("");

  const activeOrgId = currentUser.orgId || organization?.orgId || "ORG-ARGUS";
  const activeOrgName = organization?.name || currentUser.orgName || "Argus CNC Technologies Ltd";

  // Fetch live users and franchises from DB
  const loadData = async () => {
    try {
      const [uRes, fRes] = await Promise.all([
        fetch(`/api/users?orgId=${activeOrgId}`),
        fetch("/api/franchises"),
      ]);

      if (uRes.ok) {
        const uData: UserSession[] = await uRes.json();
        if (uData.length > 0) {
          // Merge with any local demo users
          setUsersList(uData);
        }
      }

      if (fRes.ok) {
        const fData: Franchise[] = await fRes.json();
        setFranchises(fData);
        if (fData.length > 0 && !newFranchiseId) {
          setNewFranchiseId(fData[0].code);
        }
      }
    } catch (e) {
      console.error("Failed to load users/franchises:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrgId]);

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setError("Name and Email are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const selectedFranchise = franchises.find((f) => f.code === newFranchiseId);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: activeOrgId,
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          franchiseId: newRole === "head_office_admin" || newRole === "finance_accounts" ? null : newFranchiseId,
          franchiseName: newRole === "head_office_admin" || newRole === "finance_accounts" ? undefined : selectedFranchise?.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add personnel.");
        setLoading(false);
        return;
      }

      // Success
      registerNewUser(data);
      setUsersList((prev) => [...prev.filter((u) => u.email !== data.email), data]);
      setSuccessMsg(`User ${data.name} (${data.email}) added! They can now sign in via Google.`);
      setIsModalOpen(false);
      setNewName("");
      setNewEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to add personnel.");
    } finally {
      setLoading(false);
    }
  };

  const rolePermissions = [
    {
      role: "Head Office Admin",
      code: "head_office_admin",
      access:
        "Full organization master control: franchises, product & price control, territory mapping, discount approval, consolidated reports.",
    },
    {
      role: "Franchise Admin",
      code: "franchise_admin",
      access:
        "Franchise branch management: team oversight, leads, quotations, orders, installations, support, commissions.",
    },
    {
      role: "Franchise Sales",
      code: "franchise_sales",
      access:
        "Field prospect pipeline: follow-ups, machine demos, standard quotes within discount thresholds.",
    },
    {
      role: "Service Engineer",
      code: "service_engineer",
      access:
        "Machine commissioning: 5-step checklist, operator training, customer sign-off, breakdown tickets.",
    },
    {
      role: "Finance / Accounts",
      code: "finance_accounts",
      access:
        "Milestone payment receipt, outstanding balances, commission calculation, disbursement, financial audit.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Organization Directory
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-bold text-[#FF6600] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              {activeOrgName}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Users, Personnel & Role-Based Access Control
          </h1>
          <p className="text-xs text-slate-500">
            Invite franchise admins, sales reps, and service engineers. Only registered Google emails can access this organization.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-xs font-bold underline opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Team Security Partition Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#293033] text-[#FF6600] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              B2B SaaS Multi-Tenant Isolation Enforced
            </div>
            <p className="text-slate-500 text-[11px]">
              Personnel registered below are strictly bound to <strong>{activeOrgName}</strong>. They cannot access other organizations.
            </p>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Total Authorized Accounts: <strong className="text-slate-800">{usersList.length}</strong>
        </div>
      </div>

      {/* User Profiles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033]">
            Authorized Personnel Directory
          </h3>
          <span className="text-[11px] text-slate-400">
            Google SSO Ready
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>User Name & Google Email</th>
                <th>Role</th>
                <th>Assigned Franchise</th>
                <th>Status</th>
                <th className="text-right">Action / Persona Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((usr) => {
                const isCurrent = usr.id === currentUser.id;

                return (
                  <tr
                    key={usr.id || usr.email}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCurrent ? "bg-orange-50/40" : ""
                    }`}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#293033] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {usr.avatar || usr.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{usr.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{usr.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded capitalize">
                        {usr.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-slate-800">
                        {usr.franchiseName || (usr.role.includes("franchise") ? usr.franchiseId : "Head Office Central Command")}
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="text-right">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6600] bg-orange-50 px-2 py-1 rounded border border-orange-200">
                          <span>Active Role</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => switchRole(usr.id)}
                          className="px-3 py-1 bg-[#293033] hover:bg-[#FF6600] text-white text-xs font-bold rounded transition-colors cursor-pointer"
                        >
                          Switch Role
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#293033] pb-2 border-b border-slate-100 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#FF6600]" />
          <span>Role Permissions Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolePermissions.map((rp) => (
            <div key={rp.code} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{rp.role}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{rp.access}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Personnel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6600] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Add Organization Personnel</h3>
                  <p className="text-[11px] text-slate-500">
                    Authorize a team member to access {activeOrgName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPersonnel} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent font-medium"
                />
              </div>

              {/* Authorized Google Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Authorized Google Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="ramesh.cbe@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Must be their Google/Gmail address. Only this email can log in.
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserSession["role"])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent font-medium bg-white"
                >
                  <option value="franchise_admin">Franchise Admin</option>
                  <option value="franchise_sales">Franchise Sales</option>
                  <option value="service_engineer">Service Engineer</option>
                  <option value="finance_accounts">Finance / Accounts</option>
                  <option value="head_office_admin">Head Office Admin</option>
                </select>
              </div>

              {/* Franchise Selection (if applicable) */}
              {newRole !== "head_office_admin" && newRole !== "finance_accounts" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assign to Franchise <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newFranchiseId}
                    onChange={(e) => setNewFranchiseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#FF6600] focus:border-transparent font-medium bg-white"
                  >
                    {franchises.map((f) => (
                      <option key={f.code} value={f.code}>
                        {f.name} ({f.code}) - {f.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Adding..." : "Add & Authorize Member"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
