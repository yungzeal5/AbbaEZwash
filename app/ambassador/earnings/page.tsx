"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, Calendar, Package, ArrowUp, ArrowDown, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";

interface Commission {
  _id: string;
  ambassador_name: string;
  customer_name: string;
  order_id: string;
  order_amount: number;
  commission_amount: number;
  created_at: string;
}

export default function AmbassadorEarnings() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const data = await apiRequest("/users/ambassador/commissions/");
      setCommissions(data);
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = commissions.reduce((sum, c) => sum + c.commission_amount, 0);

  return (
    <div className="space-y-12 !pb-20 !pt-10 !ml-5 !mr-5 animate-in slide-in-from-right-5 duration-700">
      {/* Earnings Overview Header */}
      <section className="bg-white rounded-[2.5rem] !p-12 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden text-center md:text-left">
        <div className="space-y-6 relative z-10">
          <div className="inline-block bg-[#0071E3]/10 text-[#0071E3] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
            Available Balance
          </div>
          <div className="space-y-1">
            <h1 className="text-6xl font-black tracking-tight justify-center md:justify-start">
              {formatMoney(totalEarned)}
            </h1>
            <p className="text-[#86868B] text-lg font-medium">
              Your commissions are auto-credited to your linked mobile wallet.
            </p>
          </div>
          <p className="text-sm text-[#86868B] font-semibold">
            Withdrawals and bank settings are managed by operations for now.
          </p>
        </div>

        <div className="w-80 h-48 bg-gray-50 rounded-3xl relative z-10 border border-gray-100 flex items-center justify-center group overflow-hidden shadow-inner">
          {/* Apple Card Style Representation */}
          <div className="absolute inset-0 bg-linear-to-br from-[#1D1D1F] to-[#424245] group-hover:scale-105 transition-transform duration-700"></div>
          <div className="absolute top-6 left-6 text-white/40">
            <CreditCard size={24} />
          </div>
          <div className="absolute bottom-6 right-6 text-white/80 font-mono text-xl tracking-widest">
            **** 7890
          </div>
          <div className="absolute inset-0 bg-linear-to-tr from-[#0071E3]/20 to-transparent"></div>
          <div className="relative z-20 text-white font-bold text-lg select-none opacity-20 group-hover:opacity-100 transition-opacity duration-500">
            ABBA PLATINUM
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* Transaction History */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight">Earnings History</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="apple-card h-24 animate-pulse bg-white border-none"></div>
            ))}
          </div>
        ) : commissions.length === 0 ? (
          <div className="apple-card py-32 text-center bg-white border-none shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-[#86868B] mb-6">
              <DollarSign size={32} />
            </div>
            <h3 className="text-2xl font-bold">No earnings yet</h3>
            <p className="text-[#86868B] max-w-sm mx-auto mt-2">
              When your referrals complete their orders, your earnings will appear here beautifully!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {commissions.map((c) => (
              <div
                key={c._id}
                className="apple-card group flex items-center justify-between py-6 bg-white! hover:bg-white! border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <ArrowUp size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">Commission Earned</h4>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[#86868B]">
                        Order #{c.order_id}
                      </span>
                    </div>
                    <p className="text-[#86868B] text-sm font-medium flex items-center gap-2">
                      <Calendar className="text-[#D2D2D7]" size={14} />{" "}
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="text-[#D2D2D7]">•</span>
                      <Package className="text-[#D2D2D7]" size={14} /> From {c.customer_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600 tracking-tight">
                    +{formatMoney(c.commission_amount)}
                  </p>
                  <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest mt-1">
                    Status: Confirmed
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
