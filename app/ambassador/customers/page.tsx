"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";

interface Referral {
  id: number;
  username: string;
  name: string;
  date_joined: string;
  total_spent: number;
  commission_earned: number;
}

export default function AmbassadorCustomers() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const data = await apiRequest("/users/ambassador/referrals/");
      setReferrals(data.referrals);
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(
    (r) =>
      r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const targetReferrals = 100;
  const progressPercent = Math.min(
    100,
    Math.round((referrals.length / targetReferrals) * 100),
  );
  const referralsRemaining = Math.max(targetReferrals - referrals.length, 0);

  return (
    <div className="space-y-8 min-h-screen !mr-5 !ml-5 !pb-20">
      {/* Header with Search */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden text-center md:text-left !pt-10">
        <div className="space-y-6 relative z-10">
          <h1 className="text-6xl font-black tracking-tight justify-center md:justify-start">
            My Referrals
          </h1>
          <p className="text-[#86868B] font-medium">
            Manage and track customers you have brought to Abba.
          </p>
        </div>

        <div className="relative w-full md:w-80 group !mb-6">
          <Search className="absolute left-4 top-1/2-translate-y-1/2 text-[#86868B] group-focus-within:text-[#0071E3] transition-colors" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full bg-white/50 backdrop-blur-md border border-[#D2D2D7]/50 rounded-2xl !py-3 !pl-12 !pr-4 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Customer Grid */}
      {loading ? (
        <div className="flex flex-wrap gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="apple-card w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] h-64 animate-pulse bg-white/50 border-none"
            ></div>
          ))}
        </div>
      ) : filteredReferrals.length === 0 ? (
        <div className="apple-card text-center py-20 bg-white/50 border-dashed border-2 border-[#D2D2D7]">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#0071E3] mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold">No customers found</h3>
          <p className="text-[#86868B] mt-2 max-w-xs mx-auto">
            Start sharing your code to grow your list of referred customers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 !mb-6">
          {filteredReferrals.map((customer) => (
            <div key={customer.id} className="apple-card group hover:bg-white!">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/5 text-[#0071E3] flex items-center justify-center font-bold text-xl group-hover:bg-[#0071E3] group-hover:text-white transition-all duration-500 shadow-inner">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">{customer.name}</h3>
                  <p className="text-[#86868B] text-sm mt-2">@{customer.username}</p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                      customer.total_spent > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {customer.total_spent > 0 ? "Active" : "New"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#D2D2D7]/20 mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-[#86868B] uppercase tracking-widest font-bold">
                    Contribution
                  </p>
                  <p className="font-bold">{formatMoney(customer.total_spent)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#86868B] uppercase tracking-widest font-bold">
                    Earned
                  </p>
                  <p className="font-bold text-[#0071E3]">
                    {formatMoney(customer.commission_earned)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[#86868B] text-xs font-medium">
                <div className="flex items-center gap-1">
                  <Calendar size={14} /> Joined{" "}
                  {new Date(customer.date_joined).toLocaleDateString()}
                </div>
                <span className="text-[#0071E3] font-bold flex items-center gap-1">
                  Referred Customer <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Program Insights Section */}
      <section className="pt-12">
        <div className="apple-card bg-[#1D1D1F] text-white flex flex-col md:flex-row items-center gap-12 p-12 overflow-hidden relative border-none">
          <div className="space-y-6 flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <Star className="text-yellow-400" size={14} />
              <span className="text-xs text-blue-600 font-bold uppercase tracking-widest">Success Program</span>
            </div>
            <h2 className="text-4xl text-[#0071E3] font-bold leading-tight">
              Refer {referralsRemaining} more users to unlock{" "}
              <span className="text-[#0071E3]">Diamond Status</span>
            </h2>
            <p className="text-[#86868B] text-lg">
              Diamond ambassadors receive early access to new features and a increased 7% commission
              rate on special campaigns.
            </p>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#0071E3] h-full rounded-full shadow-[0_0_15px_#0071E3]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm font-bold text-[#86868B]">
              CURRENT PROGRESS: {referrals.length} / {targetReferrals} REFERRALS
            </p>
          </div>

          <div className="w-full md:w-1/3 flex justify-center relative scale-125 md:scale-150 rotate-12 opacity-50 md:opacity-100">
            <Users size={200} className="text-white/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-[#0071E3] rounded-full blur-[80px]"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
