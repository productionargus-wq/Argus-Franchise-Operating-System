"use client";

import React, { useState, useEffect } from "react";
import { ProductMasterItem } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { Modal } from "@/components/ui/Modal";
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Trash2,
} from "lucide-react";

export default function PriceMasterPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<ProductMasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductMasterItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New product form
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "CNC Machines",
    listPrice: 1500000,
    franchisePurchasePrice: 1200000,
    minSellingPrice: 1350000,
    maxDiscountPercent: 10,
    gstPercent: 18,
    installationCharge: 35000,
    warrantyPeriodMonths: 12,
    renewalAmcRules: "Standard 1-year AMC post warranty",
    description: "",
  });

  const loadProducts = async () => {
    if (!currentUser?.orgId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const url = `/api/products?orgId=${encodeURIComponent(currentUser.orgId!)}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentUser?.orgId]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          orgId: currentUser?.orgId,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || !currentUser?.orgId) return;
    setDeleting(true);
    try {
      const id = productToDelete._id || productToDelete.sku;
      const res = await fetch(
        `/api/products?id=${encodeURIComponent(id)}&orgId=${encodeURIComponent(currentUser.orgId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        loadProducts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter((p) => {
    return (
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#293033] tracking-tight">
            Central Price Master & Product Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Head Office authoritative master. Controls List Prices, Franchise Transfer Rates, Minimum Selling Prices, and Discount Policy.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add SKU Master</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU code, Product name, Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
          />
        </div>
      </div>

      {/* Price Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-compact">
            <thead>
              <tr>
                <th>SKU Code</th>
                <th>Product Description</th>
                <th>Category</th>
                <th>List Price (MSRP)</th>
                <th>Franchise Transfer Price</th>
                <th>Min Selling Price</th>
                <th>Max Allowed Disc %</th>
                <th>GST %</th>
                <th>Installation Fee</th>
                <th>Price Control Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400">
                    Loading price master...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400">
                    No products found in master catalog.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-bold text-[#FF6600] whitespace-nowrap">{prod.sku}</td>
                    <td>
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</div>
                    </td>
                    <td>
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded">
                        {prod.category}
                      </span>
                    </td>
                    <td className="font-bold text-slate-900">
                      ₹{prod.listPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="font-semibold text-slate-700">
                      ₹{prod.franchisePurchasePrice.toLocaleString("en-IN")}
                    </td>
                    <td className="font-black text-emerald-800">
                      ₹{prod.minSellingPrice.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className="bg-orange-100 text-orange-800 text-xs font-black px-2 py-0.5 rounded">
                        {prod.maxDiscountPercent}%
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{prod.gstPercent}%</td>
                    <td className="text-xs text-slate-600">
                      ₹{prod.installationCharge.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> Locked by HO
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setProductToDelete(prod);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Delete Product SKU"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SKU Master Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add SKU to Head Office Price Master"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. ARG-VMC-1000"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. ARGUS High-Speed VMC-1000"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              >
                <option value="CNC Machines">CNC Machines</option>
                <option value="CNC Accessories">CNC Accessories</option>
                <option value="Software">Software & Controller</option>
                <option value="AMC / Service">AMC / Service</option>
                <option value="Spare Parts">Spare Parts</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">List Price (MSRP ₹) *</label>
              <input
                type="number"
                required
                value={form.listPrice}
                onChange={(e) => setForm({ ...form, listPrice: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Franchise Purchase Price (₹) *</label>
              <input
                type="number"
                required
                value={form.franchisePurchasePrice}
                onChange={(e) => setForm({ ...form, franchisePurchasePrice: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Selling Price (Floor ₹) *</label>
              <input
                type="number"
                required
                value={form.minSellingPrice}
                onChange={(e) => setForm({ ...form, minSellingPrice: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maximum Allowed Discount % *</label>
              <input
                type="number"
                required
                max="30"
                value={form.maxDiscountPercent}
                onChange={(e) => setForm({ ...form, maxDiscountPercent: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Installation Charge (₹)</label>
              <input
                type="number"
                value={form.installationCharge}
                onChange={(e) => setForm({ ...form, installationCharge: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technical Specifications</label>
            <textarea
              rows={3}
              placeholder="Spindle speed, axis travels, controller type..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#FF6600]"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-lg shadow-xs"
            >
              Save Master SKU
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Product Master Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product Master SKU"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete SKU <strong className="text-slate-900">{productToDelete?.sku}</strong> ({productToDelete?.name})? This action cannot be undone.
          </p>
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg shadow-xs cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete SKU"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
