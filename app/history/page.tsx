"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  order_id: string;
  status: string;
  total_price: number;
  created_at: string;
  is_reviewed?: boolean;
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
  const [activeTab, setActiveTab] = useState("All");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await apiRequest("/orders/");
        setOrders(data);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load order history.";
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      await apiRequest("/orders/review/", {
        method: "POST",
        body: JSON.stringify({
          order_id: selectedOrder.order_id,
          rating,
          comment,
        }),
      });
      // Refresh orders
      const updatedOrders = await apiRequest("/orders/");
      setOrders(updatedOrders);
      setShowReviewModal(false);
      setComment("");
      setRating(5);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit review";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {formatMoney(orders.reduce((s, o) => s + o.total_price, 0), {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
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
                                {formatMoney(order.total_price)}
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
                          <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted">
                            <div className="flex gap-4">
                              <span>{order.items.length} Items</span>
                              <span>
                                {new Date(order.created_at).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>

                            {order.status === "DELIVERED" &&
                              !order.is_reviewed && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                    setShowReviewModal(true);
                                  }}
                                  className="flex items-center gap-1.5 text-primary font-bold hover:text-white transition-colors py-1 px-3 rounded-lg bg-primary/5 border border-primary/10"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  Rate & Review
                                </button>
                              )}

                            {order.is_reviewed && (
                              <span className="flex items-center gap-1 text-green-400">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                Reviewed
                              </span>
                            )}
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-md p-8 glass-panel border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Rate Order</h2>
            <p className="text-muted text-sm mb-6 font-mono">
              #{selectedOrder?.order_id}
            </p>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs text-muted uppercase font-bold tracking-widest">
                  Your Rating
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`p-2 transition-all ${rating >= s ? "text-gold scale-110" : "text-white/10"}`}
                    >
                      <Star
                        className={`w-8 h-8 ${rating >= s ? "fill-current" : ""}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted uppercase font-bold tracking-widest">
                  Experience (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the service? (e.g. perfectly cleaned, timely pickup...)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary min-h-[100px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleSubmitReview}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
