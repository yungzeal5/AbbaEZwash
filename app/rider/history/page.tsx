"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  Bike,
  Package,
  Calendar,
  ChevronRight,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";

interface Order {
  _id: string;
  order_id: string;
  customer_name: string;
  status: string;
  total_price: number;
  pickup_location: string | { address: string };
  created_at: string;
  updated_at: string;
}

interface Stats {
  total_assigned: number;
  total_delivered: number;
  total_picked_up: number;
}

export default function RiderHistoryPage() {
  const [history, setHistory] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historyData, statsData] = await Promise.all([
        apiRequest("/users/rider/history/"),
        apiRequest("/users/rider/stats/"),
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch rider history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "ACCEPTED":
        return "bg-violet-100 text-violet-700 border-violet-200";
      case "READY":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">
          Syncing your history...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Page Header */}
      <section>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Task History</h1>
        <p className="text-slate-500 font-medium !mt-1">
          Track your performance and past deliveries.
        </p>
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[28px] !p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black !mb-1">
              Deliveries
            </p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.total_delivered || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-[28px] !p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black !mb-1">
              Pickups
            </p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.total_picked_up || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white rounded-[28px] !p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black !mb-1">
              All Tasks
            </p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.total_assigned || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bike size={24} />
          </div>
        </div>
      </div>

      {/* History List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between !px-1">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Clock className="text-primary w-5 h-5" />
            Recent Logs
          </h2>
          <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-white !px-3 !py-1 rounded-full border border-slate-100">
            <TrendingUp size={12} className="text-green-500" />
            Live Data
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-[40px] !p-12 text-center border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center !mx-auto text-slate-300 !mb-4">
              <Calendar size={40} />
            </div>
            <h4 className="text-xl font-bold text-slate-900">No activity logged</h4>
            <p className="text-slate-500 max-w-xs !mx-auto !mt-2">
              Once you start accepting and completing tasks, your history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 !pb-20">
            {history.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-[32px] !p-6 shadow-sm border border-slate-50 group hover:shadow-xl hover:shadow-slate-200/50 transition-all active:scale-[0.99] cursor-pointer !mb-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                      <Package className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-lg text-slate-900">{order.order_id}</span>
                        <span
                          className={`!px-3 !py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-bold flex items-center gap-1.5">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <MapPin size={12} />
                        {typeof order.pickup_location === "object"
                          ? order.pickup_location.address
                          : order.pickup_location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">
                        {formatMoney(order.total_price)}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Value</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
                      <div className="flex flex-col md:items-end">
                        <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                          Last Update
                        </p>
                        <p className="text-xs font-bold text-slate-600">
                          {new Date(order.updated_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors hover:translate-x-1 duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
