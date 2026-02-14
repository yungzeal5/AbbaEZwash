"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Trash2,
  Eye,
  Award,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  DollarSign,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import { toast } from "react-hot-toast";

interface Ambassador {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  name: string;
  referral_code: string;
  referral_count: number;
  total_earnings: number;
  date_joined: string;
  is_active: boolean;
}

export default function AmbassadorManagement() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    try {
      const data = await apiRequest("/users/superadmin/ambassadors/");
      setAmbassadors(data);
    } catch (error) {
      console.error("Failed to fetch ambassadors:", error);
      toast.error("Failed to load ambassadors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this ambassador? This will remove their profile and access.",
      )
    ) {
      return;
    }

    try {
      await apiRequest(`/users/superadmin/users/${id}/`, { method: "DELETE" });
      toast.success("Ambassador deleted successfully");
      setAmbassadors((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Deletion error:", error);
      toast.error("Failed to delete ambassador");
    }
  };

  const filteredAmbassadors = ambassadors.filter(
    (a) =>
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="!p-8 !pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header with Stats Overview */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ambassador Management</h1>
          <p className="text-gray-500 !mt-1">Monitor performance and manage your growth network.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white !px-4 !py-2 !mb-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Agents
              </p>
              <p className="text-lg font-bold leading-tight">{ambassadors.length}</p>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = "/admin/users")} // Redirect to general user creation for now
            className="bg-primary text-white !px-4 !py-2 !mb-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> Create New
          </button>
        </div>
      </section>

      {/* Control Bar */}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, username or email..."
            className="w-full bg-white border border-gray-100 rounded-2xl !py-3.5 !pl-12 !pr-4 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto !pb-2 md:pb-0">
          <button className="!px-5 !py-3 rounded-xl bg-primary border border-gray-100 font-bold text-sm hover:border-blue-600 transition-colors whitespace-nowrap">
            Active Only
          </button>
          <button className="!px-5 !py-3 rounded-xl bg-primary border border-gray-100 font-bold text-sm hover:border-blue-600 transition-colors whitespace-nowrap">
            Top Earners
          </button>
          <button className="!px-5 !py-3 rounded-xl bg-primary border border-gray-100 font-bold text-sm hover:border-blue-600 transition-colors whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </section>

      {/* Main Table Container */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="!px-8 !py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Ambassador
                </th>
                <th className="!px-8 !py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Referral Code
                </th>
                <th className="!px-8 !py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                  Referrals
                </th>
                <th className="!px-8 !py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Earnings
                </th>
                <th className="!px-8 !py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="!px-8 !py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="!px-8 !py-6">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAmbassadors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="!px-8 !py-20 text-center">
                    <div className="text-gray-400 space-y-2">
                      <Users className="!mx-auto opacity-20" size={48} />
                      <p className="font-bold">No ambassadors found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAmbassadors.map((amb) => (
                  <tr key={amb.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="!px-8 !py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          {amb.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{amb.name}</p>
                          <p className="text-xs text-gray-500">{amb.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="!px-8 !py-5">
                      <code className="bg-gray-100 !px-3 !py-1 rounded-lg font-mono text-blue-600 font-bold tracking-widest">
                        {amb.referral_code || "N/A"}
                      </code>
                    </td>
                    <td className="!px-8 !py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-lg">{amb.referral_count}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                          Customers
                        </span>
                      </div>
                    </td>
                    <td className="!px-8 !py-5 text-center md:text-left">
                      <p className="font-black text-blue-600">{formatMoney(amb.total_earnings)}</p>
                    </td>
                    <td className="!px-8 !py-5">
                      <span
                        className={`inline-flex items-center !px-2.5 !py-1 rounded-full text-xs font-bold ${
                          amb.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {amb.is_active ? "Active Network" : "Disabled"}
                      </span>
                    </td>
                    <td className="!px-8 !py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(amb.id)}
                          className="!p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Feature Insight Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-2xl font-bold">Growth Insight</h3>
            <p className="opacity-80 leading-relaxed font-medium">
              Your ambassador network has contributed{" "}
              <span className="text-white font-bold">24% of this month&apos;s revenue</span>.
              Consider launching a weekend campaign to boost referrals.
            </p>
            <button className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">
              View Analytics
            </button>
          </div>
          {/* Abstract Background Decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-[#1D1D1F] p-8 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Award size={24} className="text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold">Incentive Plan</h3>
            <p className="opacity-80 leading-relaxed font-medium">
              Top 3 ambassadors this month will receive{" "}
              <span className="text-yellow-400 font-bold">2% bonus commission</span> on all future
              referrals.
            </p>
            <button className="bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
              Configure Rules
            </button>
          </div>
          <div className="relative w-32 h-32 hidden lg:flex items-center justify-center">
            <div className="absolute inset-0 bg-yellow-400/20 blur-[60px] animate-pulse"></div>
            <Award size={80} className="text-yellow-400/50" />
          </div>
        </div>
      </section>
    </div>
  );
}
