"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import { Search, MoreHorizontal, Check, Bike, Clock, RotateCcw } from "lucide-react";
import OrderActionModal from "@/components/admin/OrderActionModal";

interface Order {
  _id: string;
  order_id: string;
  customer_name: string;
  status: string;
  total_price: number;
  created_at: string;
  assigned_rider_name?: string;
  user_id: string; // Add this
  items: Array<Record<string, unknown>>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalAction, setModalAction] = useState<"ACCEPT" | "ASSIGN" | "STATUS" | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/orders/admin/all/");
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openModal = (order: Order, action: "ACCEPT" | "ASSIGN" | "STATUS") => {
    setSelectedOrder(order);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "All") return matchesSearch;
    if (activeTab === "History")
      return matchesSearch && ["DELIVERED", "COMPLETED", "CANCELLED"].includes(order.status);
    return matchesSearch && order.status === activeTab.toUpperCase().replace(" ", "_");
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-500 bg-yellow-500/10";
      case "ACCEPTED":
        return "text-blue-500 bg-blue-500/10";
      case "PICKED_UP":
        return "text-purple-500 bg-purple-500/10";
      case "CLEANING":
        return "text-cyan-500 bg-cyan-500/10";
      case "READY":
        return "text-green-500 bg-green-500/10";
      case "DELIVERED":
        return "text-white bg-white/10";
      default:
        return "text-muted bg-white/5";
    }
  };

  return (
    <div className="!pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 !mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white !mb-1">Orders</h1>
          <p className="text-muted">Manage all service requests.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={fetchOrders} className="btn btn-ghost btn-sm" title="Refresh">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!pl-10 !pr-4 !py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary w-64"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 !mb-6 overflow-x-auto !pb-2 no-scrollbar">
        {["All", "Pending", "Accepted", "Cleaning", "Ready", "History"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`!px-4 !py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-white/5 text-muted hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile Card View (Visible only on small screens) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="card glass-panel !p-5 animate-pulse">
              <div className="flex justify-between !mb-4">
                <div className="h-4 w-24 bg-white/5 rounded"></div>
                <div className="h-4 w-16 bg-white/5 rounded"></div>
              </div>
              <div className="h-6 w-32 bg-white/5 rounded !mb-2"></div>
              <div className="h-4 w-20 bg-white/5 rounded"></div>
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="text-center !py-12 text-muted bg-white/5 rounded-2xl border border-dashed border-white/10">
            No orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="card glass-panel !p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">
                    #{order.order_id}
                  </span>
                  <h3 className="font-bold text-white">{order.customer_name}</h3>
                </div>
                <span
                  className={`inline-flex items-center !px-2 !py-0.5 rounded text-[9px] font-bold uppercase border ${
                    getStatusColor(order.status)
                      .replace("text-", "border-")
                      .replace("bg-", "border-opacity-20 ") +
                    " " +
                    getStatusColor(order.status)
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
                <span className="font-bold text-white">{formatMoney(order.total_price)}</span>
              </div>

              <div className="flex items-center justify-between !pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-primary" />
                  <span className="text-xs text-secondary">
                    {order.assigned_rider_name || "Unassigned"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => openModal(order, "ACCEPT")}
                      className="btn btn-xs btn-primary !px-3"
                    >
                      Accept
                    </button>
                  )}
                  {order.status !== "PENDING" &&
                    !order.assigned_rider_name &&
                    !["DELIVERED", "COMPLETED", "CANCELLED"].includes(order.status) && (
                      <button
                        onClick={() => openModal(order, "ASSIGN")}
                        className="btn btn-xs btn-secondary !px-3"
                      >
                        Assign
                      </button>
                    )}
                  <button
                    onClick={() => openModal(order, "STATUS")}
                    className="!p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (Hidden on small screens) */}
      <div className="hidden md:block card glass-panel overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                  Order ID
                </th>
                <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                  Customer
                </th>
                <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                  Date
                </th>
                <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none text-right">
                  Amount
                </th>
                <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                  Status
                </th>
                <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                  Rider
                </th>
                <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="!p-5">
                      <div className="h-4 w-20 bg-white/5 rounded"></div>
                    </td>
                    <td className="!p-5">
                      <div className="h-4 w-32 bg-white/5 rounded"></div>
                    </td>
                    <td className="!p-5">
                      <div className="h-4 w-24 bg-white/5 rounded"></div>
                    </td>
                    <td className="!p-5">
                      <div className="h-4 w-16 bg-white/5 rounded ml-auto"></div>
                    </td>
                    <td className="!p-5">
                      <div className="h-6 w-24 bg-white/5 rounded-full"></div>
                    </td>
                    <td className="!p-5">
                      <div className="h-4 w-24 bg-white/5 rounded"></div>
                    </td>
                    <td className="!p-5"></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="!p-12 text-center text-muted">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="!p-5 font-mono text-xs text-secondary font-medium tracking-wide">
                      <span className="text-muted">#</span>
                      {order.order_id}
                    </td>
                    <td className="!p-5">
                      <Link
                        href={`/admin/users/${order.user_id}`}
                        className="flex items-center gap-3 group/link w-fit"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary group-hover/link:bg-primary group-hover/link:text-white transition-all">
                          {order.customer_name.charAt(0)}
                        </div>
                        <span className="font-medium text-sm text-white group-hover/link:text-primary transition-colors">
                          {order.customer_name}
                        </span>
                      </Link>
                    </td>
                    <td className="!p-5 text-sm text-muted font-mono">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="!p-5 font-bold font-mono text-white text-right">
                      {formatMoney(order.total_price)}
                    </td>
                    <td className="!p-5">
                      <span
                        className={`inline-flex items-center !px-2.5 !py-1 rounded-md text-[10px] font-bold tracking-wide uppercase border ${
                          getStatusColor(order.status)
                            .replace("text-", "border-")
                            .replace("bg-", "border-opacity-20 ") +
                          " " +
                          getStatusColor(order.status)
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="!p-5 text-sm">
                      {order.assigned_rider_name ? (
                        <div className="flex items-center gap-2 text-white">
                          <Bike className="w-4 h-4 text-primary" />
                          {order.assigned_rider_name}
                        </div>
                      ) : (
                        <span className="text-muted text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="!p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => openModal(order, "ACCEPT")}
                            className="btn btn-xs btn-primary gap-1 shadow-lg shadow-primary/20"
                            title="Accept Order"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                        )}
                        {order.status !== "PENDING" &&
                          !order.assigned_rider_name &&
                          !["DELIVERED", "COMPLETED", "CANCELLED"].includes(order.status) && (
                            <button
                              onClick={() => openModal(order, "ASSIGN")}
                              className="btn btn-xs btn-secondary"
                              title="Assign Rider"
                            >
                              Assign
                            </button>
                          )}

                        <button
                          onClick={() => openModal(order, "STATUS")}
                          className="!p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all border border-white/5 hover:border-white/10"
                          title="Update Status"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        action={modalAction}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
