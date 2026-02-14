"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ArrowRight, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import { useRouter } from "next/navigation";

const laundryItems = [
  { id: 1, name: "T-Shirt", price: 3 },
  { id: 2, name: "Shirt (Formal)", price: 5 },
  { id: 3, name: "Pants", price: 6 },
  { id: 4, name: "Jeans", price: 7 },
  { id: 5, name: "Dress", price: 10 },
  { id: 6, name: "Suit (2-piece)", price: 20 },
  { id: 7, name: "Jacket", price: 12 },
  { id: 8, name: "Sweater", price: 8 },
  { id: 9, name: "Hoodie", price: 8 },
  { id: 10, name: "Bedsheet (Single)", price: 10 },
  { id: 11, name: "Bedsheet (Double)", price: 15 },
  { id: 12, name: "Duvet Cover", price: 18 },
  { id: 13, name: "Towel (Large)", price: 6 },
  { id: 14, name: "Towel (Small)", price: 4 },
  { id: 15, name: "Curtain Panel", price: 12 },
  { id: 16, name: "Blanket", price: 20 },
];

interface SelectedItem {
  id: number;
  name: string;
  price: number;
  color: "white" | "colored";
  quantity: number;
  note: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<Map<number, SelectedItem>>(
    new Map(),
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const toggleItem = (item: (typeof laundryItems)[0]) => {
    const newSelected = new Map(selected);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
      if (expanded === item.id) setExpanded(null);
    } else {
      newSelected.set(item.id, {
        ...item,
        color: "colored",
        quantity: 1,
        note: "",
      });
      setExpanded(item.id);
    }
    setSelected(newSelected);
  };

  const updateItem = (id: number, updates: Partial<SelectedItem>) => {
    const newSelected = new Map(selected);
    const item = newSelected.get(id);
    if (item) {
      newSelected.set(id, { ...item, ...updates });
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
          <h1
            className="text-title"
            style={{ marginBottom: "12px", color: "var(--accent)" }}
          >
            Order Placed!
          </h1>
          <p className="text-body">
            Your order {submittedId} has been successfully submitted.
          </p>
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
      <section style={{ padding: "24px 0" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-label" style={{ marginBottom: "8px" }}>
              New Order
            </p>
            <h1 className="text-title">Select your items</h1>
          </motion.div>
        </div>
      </section>

      {/* Items List */}
      <section>
        <div className="container">
          <div
            className="card"
            style={{
              padding: 0,
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            {laundryItems.map((item, index) => {
              const isSelected = selected.has(item.id);
              const selectedItem = selected.get(item.id);
              const isExpanded = expanded === item.id && isSelected;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  {/* Item Row */}
                  <button
                    onClick={() => toggleItem(item)}
                    className="list-item list-item-interactive w-full"
                    style={{
                      justifyContent: "space-between",
                      borderBottom: isExpanded ? "none" : undefined,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: isSelected
                            ? "var(--primary)"
                            : "rgba(255, 255, 255, 0.05)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        {isSelected && (
                          <Check
                            className="w-3 h-3 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          color: isSelected
                            ? "var(--primary)"
                            : "var(--text-secondary)",
                        }}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedItem && selectedItem.quantity > 1 && (
                        <span className="text-caption">
                          x{selectedItem.quantity}
                        </span>
                      )}
                      <span
                        className="price"
                        style={{
                          color: isSelected ? "var(--primary)" : "inherit",
                        }}
                      >
                        {formatMoney(
                          selectedItem
                            ? item.price * selectedItem.quantity
                            : item.price,
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
                          {/* Color */}
                          <div className="flex items-center justify-between">
                            <span className="text-caption">Color</span>
                            <div className="toggle-group">
                              <button
                                onClick={() =>
                                  updateItem(item.id, { color: "white" })
                                }
                                className={`toggle-btn ${
                                  selectedItem.color === "white" ? "active" : ""
                                }`}
                                style={
                                  selectedItem.color === "white"
                                    ? {
                                        background: "var(--primary)",
                                        color: "white",
                                      }
                                    : {}
                                }
                              >
                                White
                              </button>
                              <button
                                onClick={() =>
                                  updateItem(item.id, { color: "colored" })
                                }
                                className={`toggle-btn ${
                                  selectedItem.color === "colored"
                                    ? "active"
                                    : ""
                                }`}
                                style={
                                  selectedItem.color === "colored"
                                    ? {
                                        background: "var(--primary)",
                                        color: "white",
                                      }
                                    : {}
                                }
                              >
                                Colored
                              </button>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="flex items-center justify-between">
                            <span className="text-caption">Quantity</span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  updateItem(item.id, {
                                    quantity: Math.max(
                                      1,
                                      selectedItem.quantity - 1,
                                    ),
                                  })
                                }
                                className="btn-icon btn-ghost flex items-center justify-center"
                                style={{
                                  background: "rgba(255, 255, 255, 0.05)",
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
                                  updateItem(item.id, {
                                    quantity: selectedItem.quantity + 1,
                                  })
                                }
                                className="btn-icon btn-ghost flex items-center justify-center"
                                style={{
                                  background: "rgba(255, 255, 255, 0.05)",
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
                            onChange={(e) =>
                              updateItem(item.id, { note: e.target.value })
                            }
                            style={{
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          />
                        </div>
                        <div className="divider" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
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
                  background: "rgba(10, 10, 10, 0.8)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--border-gold)",
                  boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.4)",
                }}
              >
                <div>
                  <p className="text-caption">
                    {count} item{count !== 1 ? "s" : ""}
                  </p>
                  <p
                    className="price price-lg"
                    style={{ color: "var(--primary)" }}
                  >
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
