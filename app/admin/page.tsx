"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  ArrowUpRight,
  Search,
  Loader2,
  Star,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
  total_orders: number;
  pending: number;
  in_progress: number;
  delivered: number;
  total_revenue: number;
  total_riders: number;
  total_customers: number;
  reviews: number;
  complaints: number;
}

interface Order {
  _id: string;
  order_id: string;
  customer_name: string;
  status: string;
  total_price: number;
  created_at: string;
  items: Array<Record<string, unknown>>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          apiRequest("/orders/admin/stats/"),
          apiRequest("/orders/admin/all/"),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5)); // Get top 5 recent
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredRecentOrders = recentOrders.filter((order) => {
    const query = searchTerm.toLowerCase();
    return (
      order.order_id.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query)
    );
  });

  const statCards = [
    {
      label: "Total Revenue",
      value: formatMoney(stats.total_revenue),
      trend: "Lifetime",
      icon: DollarSign,
      color: "var(--gold)",
    },
    {
      label: "Active Orders",
      value: stats.in_progress,
      trend: "In loop",
      icon: ShoppingBag,
      color: "var(--primary)",
    },
    {
      label: "Pending Requests",
      value: stats.pending,
      trend: "Needs Action",
      icon: Clock,
      color: "var(--accent)",
    },
    {
      label: "Total Customers",
      value: stats.total_customers,
      trend: "Registered",
      icon: Users,
      color: "#A855F7",
    },
    {
      label: "Total Reviews",
      value: stats.reviews,
      trend: "User Feedback",
      icon: Star,
      color: "var(--gold)",
    },
    {
      label: "Complaints",
      value: stats.complaints,
      trend: "Needs Attention",
      icon: MessageSquare,
      color: "#F43F5E",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-center !pb-20 gap-4 !mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white !mb-1">Dashboard</h1>
          <p className="text-muted">
            Welcome back, Admin. Here is what is happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            className="!pl-10 !pr-4 !py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 !mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card glass-panel !p-6 relative overflow-hidden group hover:border-white/20 transition-all"
            >
              {/* Background Glow */}
              <div
                className="absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-all duration-500 bg-current"
                style={{ color: stat.color }}
              />

              <div className="flex justify-between items-start mb-6">
                <div
                  className="!p-3.5 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300"
                  style={{ color: stat.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase !px-2.5 !py-1 rounded-full bg-white/5 text-muted border border-white/5">
                  {stat.trend}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>

              <div>
                <p className="text-muted text-sm font-medium !mb-1 tracking-wide">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Platform Overview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card glass-panel !p-8 !mb-8">
            <div className="flex items-center justify-between !mb-8">
              <div>
                <h3 className="font-bold text-xl text-white !mb-1">
                  Platform Performance
                </h3>
                <p className="text-muted text-sm">
                  Real-time order completion metrics
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 !mb-8">
              <div className="space-y-2">
                <p className="text-muted text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-white">
                  {stats.total_orders}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(
                    (stats.delivered / (stats.total_orders || 1)) * 100,
                  )}
                  %
                </p>
              </div>
            </div>

            {/* Progress Bar Visual */}
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden !mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                style={{
                  width: `${(stats.delivered / (stats.total_orders || 1)) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 left-0 h-full bg-yellow-500/50 transition-all duration-1000 ease-out rounded-full"
                style={{
                  width: `${(stats.pending / (stats.total_orders || 1)) * 100}%`,
                  left: `${(stats.delivered / (stats.total_orders || 1)) * 100}%`,
                }}
              />
            </div>

            <div className="flex gap-6 text-xs text-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Active/Pending</span>
              </div>
            </div>
          </div>

          <div className="card glass-panel !p-8 space-y-5">
            <div>
              <h3 className="font-bold text-xl text-white !mb-1">
                Order Status Breakdown
              </h3>
              <p className="text-muted text-sm">
                Live distribution of current order states.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Pending", value: stats.pending, color: "bg-yellow-500" },
                {
                  label: "In Progress",
                  value: stats.in_progress,
                  color: "bg-blue-500",
                },
                { label: "Delivered", value: stats.delivered, color: "bg-green-500" },
              ].map((item) => {
                const percent = Math.round(
                  (item.value / (stats.total_orders || 1)) * 100,
                );
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm !mb-1">
                      <span className="text-secondary">{item.label}</span>
                      <span className="text-white font-semibold">
                        {item.value} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="card glass-panel !p-0 overflow-hidden h-fit sticky top-6">
          <div className="!p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-bold text-lg text-white">Recent Activity</h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-primary hover:text-white transition-colors"
            >
              VIEW ALL
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {filteredRecentOrders.length === 0 ? (
              <p className="text-muted text-center !py-12 text-sm">
                No matching recent activity.
              </p>
            ) : (
              filteredRecentOrders.map((order) => (
                <Link
                  href={`/admin/orders?highlight=${order.order_id}`}
                  key={order._id}
                  className="block hover:bg-white/5 transition-colors group"
                >
                  <div className="!p-4 flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg transition-transform group-hover:scale-105 ${
                        order.status === "PENDING"
                          ? "bg-yellow-500 text-black"
                          : order.status === "ACCEPTED"
                            ? "bg-blue-500 text-white"
                            : "bg-green-500 text-white"
                      }`}
                    >
                      {order.customer_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline !mb-1">
                        <p className="font-bold text-sm truncate text-white group-hover:text-primary transition-colors">
                          {order.customer_name}
                        </p>
                        <span className="text-xs font-mono text-muted">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-[10px] font-bold !px-2 !py-0.5 rounded-full border ${
                            order.status === "PENDING"
                              ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              : order.status === "ACCEPTED"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-muted font-medium">
                          {formatMoney(order.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}

            {/* View More Button */}
            <Link
              href="/admin/orders"
              className="block !p-4 text-center text-xs font-bold text-muted hover:text-white transition-colors bg-white/[0.02] hover:bg-white/5"
            >
              VIEW ORDER HISTORY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
