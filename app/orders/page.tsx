"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ArrowRight, LogIn, Loader2, Search, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import { useRouter } from "next/navigation";

interface CatalogItem {
  name: string;
  price: number;
  category: string;
  variant?: string | null;
}

interface SelectedItem extends CatalogItem {
  quantity: number;
  note: string;
  color: "white" | "colored";
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [selected, setSelected] = useState<Map<string, SelectedItem>>(new Map());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const data = await apiRequest("/orders/catalog/");
        setCatalog(data);
      } catch (err) {
        console.error("Failed to fetch catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(catalog.map((item) => item.category));
    return ["All", ...Array.from(cats)];
  }, [catalog]);

  const filteredItems = useMemo(() => {
    return catalog.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, searchTerm, activeCategory]);

  const toggleItem = (item: CatalogItem) => {
    const newSelected = new Map(selected);
    if (newSelected.has(item.name)) {
      newSelected.delete(item.name);
      if (expanded === item.name) setExpanded(null);
    } else {
      newSelected.set(item.name, {
        ...item,
        color: "colored",
        quantity: 1,
        note: "",
      });
      setExpanded(item.name);
    }
    setSelected(newSelected);
  };

  const updateItem = (name: string, updates: Partial<SelectedItem>) => {
    const newSelected = new Map(selected);
    const item = newSelected.get(name);
    if (item) {
      newSelected.set(name, { ...item, ...updates });
      setSelected(newSelected);
    }
  };

  const total = useMemo(() => {
    let sum = 0;
    selected.forEach((item) => (sum += item.price * item.quantity));
    return sum;
  }, [selected]);

  const count = useMemo(() => {
    let c = 0;
    selected.forEach((item) => (c += item.quantity));
    return c;
  }, [selected]);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsArray = Array.from(selected.values()).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        color: item.color,
        note: item.note,
        price_per_unit: item.price,
      }));

      const res = await apiRequest("/orders/", {
        method: "POST",
        body: JSON.stringify({
          items: itemsArray,
          total_price: total,
          phone_number: user.phone_number,
          location: user.location,
        }),
      });

      setSubmittedId(res.order_id);
      setSelected(new Map());
      setTimeout(() => {
        router.push("/history");
      }, 2000);
    } catch (error) {
      console.error("Order failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div className="page-content flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="icon-box"
            style={{
              margin: "0 auto 24px",
              background: "var(--accent)",
              color: "white",
            }}
          >
            <Check className="w-6 h-6" />
          </div>
          <h1 className="text-title" style={{ marginBottom: "12px", color: "var(--accent)" }}>
            Order Placed!
          </h1>
          <p className="text-body">Your order {submittedId} has been successfully submitted.</p>
          <p className="text-caption" style={{ marginTop: "24px" }}>
            Redirecting to history...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="page-content"
      style={{ paddingBottom: selected.size > 0 ? "160px" : undefined }}
    >
      {/* Header */}
      <section style={{ padding: "24px 0 12px" }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-label" style={{ marginBottom: "8px" }}>
              New Order
            </p>
            <h1 className="text-title text-gradient">Select your items</h1>
          </motion.div>
        </div>
      </section>

      {/* Search & Categories */}
      <section className="sticky top-0 bg-white/80 backdrop-blur-md z-40 py-4! border-b border-black/5">
        <div className="container flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search for laundry items..."
              className="input pl-11! bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-primary transition-all rounded-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2!">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4! py-2! rounded-full text-xs font-bold transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Items List */}
      <section className="mt-6!">
        <div className="container">
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
            }}
          >
            {isLoading ? (
              <div className="py-20! flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-caption">Loading our catalog...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20! text-center">
                <p className="text-muted">No items found matching your search.</p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = selected.has(item.name);
                const selectedItem = selected.get(item.name);
                const isExpanded = expanded === item.name && isSelected;

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                  >
                    {/* Item Row */}
                    <button
                      onClick={() => toggleItem(item)}
                      className="list-item list-item-interactive w-full"
                      style={{
                        justifyContent: "space-between",
                        borderBottom: isExpanded ? "none" : "1px solid var(--border-default)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            background: isSelected ? "var(--primary)" : "var(--bg-muted)",
                            transition: "background 0.15s ease",
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                          <span
                            style={{
                              color: isSelected ? "var(--primary)" : "var(--text-primary)",
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] text-muted uppercase tracking-wider font-bold">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {selectedItem && selectedItem.quantity > 1 && (
                          <span className="text-caption">x{selectedItem.quantity}</span>
                        )}
                        <span
                          className="price"
                          style={{
                            color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                          }}
                        >
                          {formatMoney(
                            selectedItem ? item.price * selectedItem.quantity : item.price,
                          )}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Options */}
                    <AnimatePresence>
                      {isExpanded && selectedItem && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div
                            style={{
                              padding: "0 16px 16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 16,
                            }}
                          >
                            {/* Color Selection (only for certain items) */}
                            {(item.name.toLowerCase().includes("shirt") ||
                              item.name.toLowerCase().includes("hoodie") ||
                              item.name.toLowerCase().includes("t-shirt")) &&
                            !item.name.toLowerCase().includes("(white)") &&
                            !item.name.toLowerCase().includes("(coloured)") ? (
                              <div className="flex items-center justify-between">
                                <span className="text-caption">Fabric Treatment</span>
                                <div className="toggle-group">
                                  <button
                                    onClick={() => updateItem(item.name, { color: "white" })}
                                    className={`toggle-btn ${
                                      selectedItem.color === "white" ? "active" : ""
                                    }`}
                                  >
                                    White
                                  </button>
                                  <button
                                    onClick={() => updateItem(item.name, { color: "colored" })}
                                    className={`toggle-btn ${
                                      selectedItem.color === "colored" ? "active" : ""
                                    }`}
                                  >
                                    Colored
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            {/* Quantity */}
                            <div className="flex items-center justify-between">
                              <span className="text-caption">Quantity</span>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    updateItem(item.name, {
                                      quantity: Math.max(1, selectedItem.quantity - 1),
                                    })
                                  }
                                  className="btn-icon btn-ghost flex items-center justify-center"
                                  style={{
                                    background: "var(--bg-secondary)",
                                  }}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span
                                  style={{
                                    width: 32,
                                    textAlign: "center",
                                    fontWeight: 500,
                                  }}
                                >
                                  {selectedItem.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateItem(item.name, {
                                      quantity: selectedItem.quantity + 1,
                                    })
                                  }
                                  className="btn-icon btn-ghost flex items-center justify-center"
                                  style={{
                                    background: "var(--bg-secondary)",
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Note */}
                            <input
                              type="text"
                              className="input"
                              placeholder="Add a note (optional)"
                              value={selectedItem.note}
                              onChange={(e) => updateItem(item.name, { note: e.target.value })}
                            />
                          </div>
                          <div className="divider" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Checkout Footer */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: "fixed",
              bottom: "calc(var(--tab-height) + 16px)",
              left: 0,
              right: 0,
              padding: "0 16px",
              zIndex: 50,
            }}
          >
            <div className="container">
              <div
                className="card flex items-center justify-between"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--border-gold)",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div>
                  <p className="text-caption">
                    {count} item{count !== 1 ? "s" : ""}
                  </p>
                  <p className="price price-lg" style={{ color: "var(--primary)" }}>
                    {formatMoney(total)}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="btn"
                  disabled={isSubmitting}
                  style={{
                    background: "var(--primary)",
                    color: "white",
                    fontWeight: 600,
                    padding: "12px 32px",
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
