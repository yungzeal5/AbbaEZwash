"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Star, Calendar, Package, Receipt, Phone } from "lucide-react";
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
  rider_info?: {
    name: string;
    phone: string;
    profile_picture: string | null;
  } | null;
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
        const errorMessage = err instanceof Error ? err.message : "Failed to load order history.";
        console.error(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : "Failed to submit review";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    return [
      { label: "Orders", value: orders.length, icon: Calendar, color: "var(--primary)" },
      {
        label: "Items",
        value: orders.reduce((s, o) => s + o.items.length, 0),
        icon: Package,
        color: "var(--secondary)",
      },
      {
        label: "Spent",
        value: formatMoney(
          orders.reduce((s, o) => s + o.total_price, 0),
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          },
        ),
        icon: Receipt,
        color: "var(--gold)",
      },
    ];
  }, [orders]);

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <section style={{ padding: "32px 0 24px" }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p
              className="text-label text-primary"
              style={{ marginBottom: "8px", letterSpacing: "0.1em" }}
            >
              Your Journey
            </p>
            <h1 className="text-title text-gradient">Order History</h1>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="mb-8!">
        <div className="container">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card flex flex-col items-center justify-center text-center py-4! px-2!"
                style={{ background: "white", borderColor: "var(--border-default)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center !mb-2"
                  style={{ background: `${stat.color}10`, color: stat.color }}
                >
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold text-slate-900 leading-tight">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Orders List */}
      <section>
        <div className="container">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 !mb-8 overflow-x-auto pb-2! no-scrollbar">
            {["All", "Pending", "Active", "History"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6! py-2! rounded-full text-xs font-bold transition-all border ${
                  activeTab === tab
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Orders Display */}
          <div className="space-y-8">
            {(() => {
              const categories = [
                { id: "Pending", title: "Pending Orders", statuses: ["PENDING"] },
                {
                  id: "Active",
                  title: "In Progress",
                  statuses: ["ACCEPTED", "PICKED_UP", "CLEANING", "READY"],
                },
                {
                  id: "History",
                  title: "Completed",
                  statuses: ["DELIVERED", "COMPLETED", "CANCELLED"],
                },
              ];

              const filteredCategories =
                activeTab === "All" ? categories : categories.filter((c) => c.id === activeTab);
              let hasOrders = false;

              const content = filteredCategories.map((cat) => {
                const catOrders = orders.filter((o) => cat.statuses.includes(o.status));
                if (catOrders.length === 0) return null;
                hasOrders = true;

                return (
                  <div key={cat.title}>
                    <h3 className="text-[10px] font-black !mb-4 uppercase tracking-[0.2em] text-primary/60 !pl-1">
                      {cat.title}
                    </h3>

                    <div className="flex flex-col gap-5">
                      {catOrders.map((order, index) => {
                        const isPast = ["DELIVERED", "COMPLETED", "CANCELLED"].includes(
                          order.status,
                        );
                        return (
                          <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="card group overflow-hidden"
                            style={{
                              background: "white",
                              padding: "24px",
                              borderColor: isPast ? "var(--border-default)" : "var(--primary-soft)",
                            }}
                          >
                            <div className="flex justify-between items-start !mb-6">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                    isPast
                                      ? "bg-slate-50 text-slate-400"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  <Package className="w-6 h-6" />
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold !mb-1 block tracking-wider uppercase">
                                    #{order.order_id}
                                  </span>
                                  <h3 className="text-body font-bold text-slate-900">
                                    {new Date(order.created_at).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </h3>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-black text-slate-900 block !mb-2 tracking-tight">
                                  {formatMoney(order.total_price)}
                                </span>
                                <span
                                  className={`!px-3 !py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                    order.status === "PENDING"
                                      ? "bg-amber-50 text-amber-600 border-amber-200"
                                      : isPast
                                        ? "bg-slate-100 text-slate-500 border-slate-200"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 !mb-6 bg-slate-50 !p-4! rounded-xl border border-slate-100">
                              {order.items.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between text-xs font-medium text-slate-600"
                                >
                                  <span>
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span className="text-slate-400 uppercase tracking-tighter text-[9px]">
                                    {item.color}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Rider Info Area */}
                            {order.rider_info && (
                              <div className="!mb-6 !p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    {order.rider_info.profile_picture ? (
                                      <img
                                        src={order.rider_info.profile_picture}
                                        alt={order.rider_info.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {order.rider_info.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                                      Your Assigned Rider
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">
                                      {order.rider_info.name}
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={`tel:${order.rider_info.phone}`}
                                  className="!p-2 bg-white text-primary rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all"
                                >
                                  <Phone className="w-5 h-5" />
                                </a>
                              </div>
                            )}

                            {/* Footer Info */}
                            <div className="!pt-4 border-t border-slate-100 flex justify-between items-center">
                              <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>{order.items.length} Items</span>
                                <span>
                                  {new Date(order.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {order.status === "DELIVERED" && !order.is_reviewed && (
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowReviewModal(true);
                                  }}
                                  className="flex items-center gap-2 text-primary font-black hover:bg-primary hover:text-white transition-all !py-2 !px-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-widest"
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  Rate Order
                                </button>
                              )}

                              {order.is_reviewed && (
                                <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  Reviewed
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              });

              if (!hasOrders) {
                return (
                  <div className="text-center !py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No orders found in {activeTab}.</p>
                  </div>
                );
              }
              return content;
            })()}
          </div>
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center !p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card w-full max-w-md !p-8 bg-white shadow-2xl! border-none"
            >
              <div className="text-center !mb-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center !mx-auto !mb-4">
                  <Star className="w-8 h-8 fill-current" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Rate Your Experience</h2>
                <p className="text-slate-400 text-xs font-bold tracking-widest !mt-1">
                  ORDER #{selectedOrder?.order_id}
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={`!p-1 transition-all hover:scale-125 ${rating >= s ? "text-amber-400" : "text-slate-200"}`}
                      >
                        <Star className={`w-10 h-10 ${rating >= s ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest !pl-1">
                    Tell us more
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Was everything perfect? (optional)"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl !p-4 text-sm text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 min-h-[120px] resize-none transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={isSubmitting}
                    onClick={() => setShowReviewModal(false)}
                    className="btn btn-secondary flex-1 py-4! rounded-2xl font-bold"
                  >
                    Not now
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleSubmitReview}
                    className="btn btn-primary flex-1 py-4! rounded-2xl font-black shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
