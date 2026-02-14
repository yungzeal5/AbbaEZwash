"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  Zap,
  ArrowUpRight,
  Activity,
  PieChart,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";

interface Stats {
  ambassador_id: number;
  custom_id: string;
  username: string;
  referral_code: string;
  referred_customers: number;
  total_orders_from_referrals: number;
  total_revenue_from_referrals: number;
  commission_rate: number;
  total_earnings: number;
}

interface Commission {
  _id: string;
  order_id: string;
  customer_name: string;
  commission_amount: number;
  created_at: string;
}

export default function AmbassadorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCommissions, setRecentCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [profileData, commissionsData] = await Promise.all([
        apiRequest("/users/ambassador/profile/"),
        apiRequest("/users/ambassador/commissions/"),
      ]);
      setStats(profileData);
      setRecentCommissions(commissionsData.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch ambassador stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-[#0071E3] rounded-full animate-spin"></div>
        <p className="text-[#86868B] font-medium animate-pulse">
          Gathering your stats...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 !ml-5 !mr-5 !pt-10 !pb-20 ">
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tight text-gradient !mb-3">
          Welcome, {stats?.username}
        </h1>
        <p className="text-[#86868B] text-xl font-medium !mb-6">
          Your referral network is growing. Here is your impact today.
        </p>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Referral Code Card - High Priority */}
        <div className="apple-card col-span-1 md:col-span-2 lg:col-span-1 bg-linear-to-br from-[#0071E3] to-[#5AC8FA] border-none! text-white! overflow-hidden relative">
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black/70 text-xs font-black uppercase tracking-widest">
                  Unique Portal
                </p>
                <h2 className="text-2xl text-black font-bold mt-1">Referral Code</h2>
              </div>
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Zap size={20} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-between border border-white/20 group">
                <span className="text-4xl font-bold text-black tracking-[0.2em]">
                  {stats?.referral_code}
                </span>
                <button
                  onClick={copyReferralCode}
                  className="bg-white text-[#0071E3] p-3 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                >
                  {copied ? <Check /> : <Copy />}
                </button>
              </div>
              <p className="text-sm text-black/80 font-medium">
                New users get a special discount using your code.
              </p>
            </div>
          </div>

          {/* Abstract background shape */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#5AC8FA]/20 rounded-full blur-3xl"></div>
        </div>

        {/* Stats Cards */}
        <div className="apple-card stat-card flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-[#0071E3] rounded-2xl group-hover:bg-[#0071E3] group-hover:text-white transition-colors duration-500">
              <Users size={24} />
            </div>
            {/* Minimal line chart placeholder */}
            <div className="flex items-end gap-1 h-8">
              <div className="w-1.5 h-4 bg-[#D2D2D7] rounded-full"></div>
              <div className="w-1.5 h-6 bg-[#D2D2D7] rounded-full"></div>
              <div className="w-1.5 h-8 bg-[#0071E3] rounded-full"></div>
              <div className="w-1.5 h-5 bg-[#D2D2D7] rounded-full"></div>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-[#86868B] font-bold text-sm uppercase tracking-wide">
              Total Referrals
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black">
                {stats?.referred_customers}
              </span>
              <span className="text-green-500 font-bold text-sm flex items-center">
                <TrendingUp className="mr-1" />
                {stats?.total_orders_from_referrals ?? 0} orders
              </span>
            </div>
          </div>
        </div>

        <div className="apple-card stat-card flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 text-[#86868B] font-bold text-xs">
              <Activity /> Live Data
            </div>
          </div>
          <div className="mt-8">
            <p className="text-[#86868B] font-bold text-sm uppercase tracking-wide">
              Total Earnings
            </p>
            <div className="mt-1">
              <span className="text-4xl font-black">
                {formatMoney(stats?.total_earnings ?? 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="apple-card lg:col-span-2 flex flex-col md:flex-row gap-8 items-center justify-between bg-white overflow-hidden relative border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <div className="space-y-4 max-w-sm relative z-10 p-2">
            <h3 className="text-2xl font-bold tracking-tight">
              Earning Potential
            </h3>
            <p className="text-[#86868B] font-medium leading-relaxed">
              Every time your referred customers wash, you earn{" "}
              <span className="text-[#0071E3] font-bold">5% commission</span>.
              Share your code to increase your passive income.
            </p>
            <Link
              href="/ambassador/customers"
              className="apple-button-primary flex items-center gap-2"
            >
              Grow Network <ArrowUpRight />
            </Link>
          </div>

          <div className="relative w-full md:w-1/2 min-h-[200px] flex items-center justify-center">
            {/* Abstract Visualization */}
            <div className="absolute inset-0 bg-blue-50/50 rounded-3xl -rotate-2"></div>
            <div className="relative z-10 flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-32 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 animate-bounce"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "3s",
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0071E3] flex items-center justify-center">
                    <DollarSign size={14} />
                  </div>
                  <div className="w-10 h-2 bg-gray-100 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent Activity */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Recent Activity</h2>
          <Link
            href="/ambassador/earnings"
            className="text-[#0071E3] font-bold hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="apple-card p-0 overflow-hidden divide-y divide-[#D2D2D7]/30">
          {recentCommissions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <PieChart size={40} />
              </div>
              <h4 className="text-xl font-bold">No orders yet</h4>
              <p className="text-[#86868B] max-w-xs mx-auto">
                Your referrals have not placed any orders yet. Once they do,
                you will see your commissions here.
              </p>
            </div>
          ) : (
            recentCommissions.map((commission) => (
              <div
                key={commission._id}
                className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors"
              >
                <div>
                  <p className="font-bold text-[#1D1D1F]">
                    Order #{commission.order_id}
                  </p>
                  <p className="text-sm text-[#86868B]">
                    {commission.customer_name}{" "}
                    {new Date(commission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-green-600">
                  +{formatMoney(commission.commission_amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
