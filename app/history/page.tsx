"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Loader2, Package } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  order_id: string;
  status: string;
  total_price: number;
  created_at: string;
  items: Array<{
    name: string;
    quantity: number;
    color: string;
  }>;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await apiRequest("/orders/");
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin text-gold"
          style={{ color: "var(--gold)" }}
        />
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <section style={{ padding: "24px 0" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-label" style={{ marginBottom: "8px" }}>
              Your Orders
            </p>
            <h1 className="text-title" style={{ color: "var(--gold)" }}>
              Order History
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ paddingBottom: "24px" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid-auto"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <div
              className="card text-center card-sm"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <p
                className="text-title"
                style={{ marginBottom: "4px", color: "var(--primary)" }}
              >
                {orders.length}
              </p>
              <p className="text-caption">Orders</p>
            </div>
            <div
              className="card text-center card-sm"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <p
                className="text-title"
                style={{ marginBottom: "4px", color: "var(--primary)" }}
              >
                {orders.reduce((s, o) => s + o.items.length, 0)}
              </p>
              <p className="text-caption">Items</p>
            </div>
            <div
              className="card text-center card-sm"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <p
                className="text-title"
                style={{ marginBottom: "4px", color: "var(--primary)" }}
              >
                ₵{orders.reduce((s, o) => s + o.total_price, 0).toFixed(0)}
              </p>
              <p className="text-caption">Total</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Orders List */}
      <section>
        <div className="container">
          {/* Tab Selector */}
          <div
            className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar"
            style={{
              maskImage:
                "linear-gradient(to right, black 85%, transparent 100%)",
            }}
          >
            {["All", "Pending", "Active", "History"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-ghost"}`}
                style={{
                  borderRadius: "20px",
                  background:
                    activeTab === tab
                      ? "var(--primary)"
                      : "rgba(255, 255, 255, 0.05)",
                  border:
                    activeTab === tab
                      ? "none"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  color: activeTab === tab ? "white" : "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Orders Display */}
          <div className="space-y-6">
            {(() => {
              const categories = [
                {
                  id: "Pending",
                  title: "Pending Request",
                  statuses: ["PENDING"],
                },
                {
                  id: "Active",
                  title: "In Progress",
                  statuses: ["ACCEPTED", "PICKED_UP", "CLEANING", "READY"],
                },
                {
                  id: "History",
                  title: "Past Orders",
                  statuses: ["DELIVERED", "COMPLETED", "CANCELLED"],
                },
              ];

              const filteredCategories =
                activeTab === "All"
                  ? categories
                  : categories.filter((c) => c.id === activeTab);

              let hasOrders = false;

              const content = filteredCategories.map((cat) => {
                const catOrders = orders.filter((o) =>
                  cat.statuses.includes(o.status),
                );
                if (catOrders.length === 0) return null;
                hasOrders = true;

                return (
                  <div key={cat.title}>
                    <h3 className="text-caption font-bold mb-3 uppercase tracking-wider opacity-60 pl-1">
                      {cat.title}
                    </h3>

                    <div className="flex flex-col gap-4">
                      {catOrders.map((order, index) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`card ${["DELIVERED", "COMPLETED", "CANCELLED"].includes(order.status) ? "" : "card-gold"}`}
                          style={{
                            padding: "20px",
                            background: [
                              "DELIVERED",
                              "COMPLETED",
                              "CANCELLED",
                            ].includes(order.status)
                              ? "rgba(255, 255, 255, 0.02)"
                              : "rgba(20, 184, 166, 0.05)",
                            border: [
                              "DELIVERED",
                              "COMPLETED",
                              "CANCELLED",
                            ].includes(order.status)
                              ? "1px solid rgba(255, 255, 255, 0.05)"
                              : "1px solid var(--primary-soft)",
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-xs text-muted font-mono mb-1 block">
                                #{order.order_id}
                              </span>
                              <h3 className="text-body font-bold text-white">
                                {new Date(order.created_at).toLocaleDateString(
                                  "en-US",
                                  { month: "long", day: "numeric" },
                                )}
                              </h3>
                            </div>
                            <div className="text-right">
                              <span className="price text-lg block mb-1">
                                ₵{order.total_price.toFixed(2)}
                              </span>
                              <span
                                className={`badge ${["DELIVERED", "COMPLETED"].includes(order.status) ? "badge-default" : "badge-accent"}`}
                                style={{
                                  background: [
                                    "DELIVERED",
                                    "COMPLETED",
                                  ].includes(order.status)
                                    ? "rgba(255,255,255,0.1)"
                                    : "var(--primary-soft)",
                                  color: ["DELIVERED", "COMPLETED"].includes(
                                    order.status,
                                  )
                                    ? "var(--text-muted)"
                                    : "var(--primary)",
                                }}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.items.map((item, i) => (
                              <div
                                key={i}
                                className="flex justify-between text-caption text-muted"
                              >
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span>{item.color}</span>
                              </div>
                            ))}
                          </div>

                          {/* Footer Info */}
                          <div className="pt-4 border-t border-white/5 flex justify-between text-xs text-muted">
                            <span>{order.items.length} Items</span>
                            <span>
                              {new Date(order.created_at).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              });

              if (!hasOrders) {
                return (
                  <div className="text-center py-12">
                    <p className="text-muted">
                      No orders found in {activeTab}.
                    </p>
                  </div>
                );
              }

              return content;
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
