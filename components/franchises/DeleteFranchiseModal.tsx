"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Franchise } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onFranchiseDeleted?: (franchiseId: string) => void;
}

export function DeleteFranchiseModal({
  isOpen,
  onClose,
  franchise,
  onFranchiseDeleted,
}: DeleteFranchiseModalProps) {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!franchise) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const targetId = franchise._id || franchise.code;
      const res = await fetch(
        `/api/franchises/${encodeURIComponent(targetId)}?orgId=${encodeURIComponent(
          currentUser?.orgId || ""
        )}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to delete franchise");
      }

      addNotification({
        title: "Franchise Removed",
        desc: `${franchise.name} (${franchise.code}) has been deleted successfully.`,
        type: "service",
        link: "/ho/franchises",
      });

      if (onFranchiseDeleted) {
        onFranchiseDeleted(franchise._id);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete franchise partner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Franchise Partner"
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs text-red-900 space-y-1">
            <p className="font-bold">Warning: This action cannot be undone.</p>
            <p className="text-red-700">
              You are about to delete franchise{" "}
              <strong className="font-bold text-red-950">
                {franchise.name} ({franchise.code})
              </strong>
              . All exclusive territory assignments and PIN code protections for this partner will be removed.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200 space-y-1 text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-400">Location:</span>
            <span className="font-semibold text-slate-800">
              {franchise.location}, {franchise.state}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Managing Partner:</span>
            <span className="font-semibold text-slate-800">{franchise.contactPerson}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Annual Quota:</span>
            <span className="font-semibold text-slate-800">
              ₹{(franchise.annualTarget / 100000).toFixed(1)} Lakhs
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? "Deleting..." : "Delete Franchise"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
