"use client";

import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Tag,
  DollarSign,
  Layers,
  Check,
  X,
  Archive,
} from "lucide-react";
import { formatMoney } from "@/lib/currency";

interface CatalogItem {
  _id?: string;
  name: string;
  price: number;
  category: string;
  variant: string | null;
  is_active: boolean;
}

export default function AdminCatalogPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formData, setFormData] = useState<CatalogItem>({
    name: "",
    price: 0,
    category: "",
    variant: null,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/orders/admin/catalog/");
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: CatalogItem | null = null) => {
    if (!isSuperAdmin) return;
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        price: 0,
        category: "Casual & Everyday Wear",
        variant: null,
        is_active: true,
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    setError(null);

    try {
      const url = editingItem
        ? `/orders/admin/catalog/${editingItem.name}/`
        : "/orders/admin/catalog/";
      const method = editingItem ? "PUT" : "POST";

      await apiRequest(url, {
        method,
        body: formData,
      });

      await fetchCatalog();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save item";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemName: string) => {
    if (!isSuperAdmin) return;
    if (!confirm(`Are you sure you want to delete ${itemName}?`)) return;

    try {
      await apiRequest(`/orders/admin/catalog/${itemName}/`, {
        method: "DELETE",
      });
      await fetchCatalog();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete item";
      alert(errorMessage);
    }
  };

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 !pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catalog Management</h1>
          <p className="text-slate-500 font-medium !mt-1">
            Manage laundry items, categories, and pricing
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center gap-2 !px-6 !py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 !mb-5"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Item</span>
          </button>
        )}
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 !mb-5">
        {[
          { label: "Total Items", value: items.length, icon: Archive, color: "bg-blue-500" },
          {
            label: "Categories",
            value: categories.length - 1,
            icon: Layers,
            color: "bg-purple-500",
          },
          {
            label: "Active Items",
            value: items.filter((i) => i.is_active).length,
            icon: Check,
            color: "bg-emerald-500",
          },
          {
            label: "Inactive",
            value: items.filter((i) => !i.is_active).length,
            icon: X,
            color: "bg-red-500",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="bg-white !p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4"
          >
            <div className={`${stat.color} !p-3 rounded-2xl text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white !p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search items or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full !pl-12 !pr-5 !py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto !pb-2 md:!pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`!px-4 !py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden !mt-5">
        {loading ? (
          <div className="!p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Loading Catalog...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="!px-6 !py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Item Name
                  </th>
                  <th className="!px-6 !py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Category
                  </th>
                  <th className="!px-6 !py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Price
                  </th>
                  <th className="!px-6 !py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="!px-6 !py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="!px-6 !py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.variant && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {item.variant}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <span className="!px-3 !py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    <td className="!px-6 !py-5">
                      <span className="font-black text-slate-900 text-lg">
                        {formatMoney(item.price)}
                      </span>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-red-500"}`}
                        />
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider ${item.is_active ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="!px-6 !py-5">
                      <div className="flex items-center gap-2">
                        {isSuperAdmin ? (
                          <>
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="!p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                              title="Edit Item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.name)}
                              className="!p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-300 uppercase italic">
                            Super Admin Only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center !p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl !p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="!p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4 !mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {editingItem ? <Edit2 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {editingItem ? "Edit Catalog Item" : "Create New Item"}
                  </h3>
                  <p className="text-slate-500 font-medium">Define laundry services and pricing</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="!p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingItem}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Duvet (Big)"
                      className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-300 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                      Price (GHS)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseFloat(e.target.value) })
                        }
                        placeholder="0.00"
                        className="w-full !pl-10 !pr-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    >
                      <option value="Casual & Everyday Wear">Casual & Everyday Wear</option>
                      <option value="Bedding & Household Items">Bedding & Household Items</option>
                      <option value="Traditional & Cultural Wear">
                        Traditional & Cultural Wear
                      </option>
                      <option value="Ladies' Wear">Ladies&apos; Wear</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Special Services">Special Services</option>
                      <option value="Packaging & Extras">Packaging & Extras</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                      Variant (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.variant || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, variant: e.target.value || null })
                      }
                      placeholder="e.g. Big, White, Tough Stains"
                      className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 !p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded-md text-primary focus:ring-primary border-slate-300"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-bold text-slate-700 select-none"
                  >
                    Item is active and visible to customers
                  </label>
                </div>

                <div className="flex gap-4 !pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 !px-6 !py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-[2] btn btn-primary flex items-center justify-center gap-2 !py-4! rounded-2xl shadow-xl shadow-primary/20 font-black transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>{editingItem ? "Update Changes" : "Create Item"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
