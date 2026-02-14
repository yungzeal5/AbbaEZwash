"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bike, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Order {
  order_id: string;
  _id: string;
  status: string;
}

interface Rider {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

interface OrderActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  action: "ACCEPT" | "ASSIGN" | "STATUS" | null;
  onSuccess: () => void;
}

export default function OrderActionModal({
  isOpen,
  onClose,
  order,
  action,
  onSuccess,
}: OrderActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRider, setSelectedRider] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen && (action === "ASSIGN" || action === "ACCEPT")) {
      fetchRiders();
    }
  }, [isOpen, action]);

  const fetchRiders = async () => {
    try {
      const data = await apiRequest("/orders/admin/riders/");
      setRiders(data);
    } catch (err) {
      console.error("Failed to fetch riders", err);
    }
  };

  const handleSubmit = async () => {
    if (!order) return;
    setLoading(true);

    try {
      if (action === "ACCEPT") {
        await apiRequest(`/orders/admin/accept/${order.order_id}/`, {
          method: "POST",
          body: JSON.stringify({
            rider_id: selectedRider || undefined,
            note,
          }),
        });
      } else if (action === "ASSIGN") {
        await apiRequest(`/orders/admin/assign/${order.order_id}/`, {
          method: "POST",
          body: JSON.stringify({
            rider_id: selectedRider,
          }),
        });
      } else if (action === "STATUS") {
        await apiRequest(`/orders/admin/status/${order.order_id}/`, {
          method: "POST",
          body: JSON.stringify({
            status: selectedStatus,
            note,
          }),
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to update order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validStatuses = [
    "PENDING",
    "ACCEPTED",
    "CLEANING",
    "READY",
    "CANCELLED",
  ];

  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center !p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between !p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-bold text-lg text-white">
              {action === "ACCEPT" && "Accept Order"}
              {action === "ASSIGN" && "Assign Rider"}
              {action === "STATUS" && "Update Status"}
            </h3>
            <button
              onClick={onClose}
              className="!p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-muted" />
            </button>
          </div>

          <div className="!p-6 space-y-6">
            <div className="bg-white/5 !p-3 rounded-lg border border-white/5">
              <p className="text-xs text-muted !mb-1">Order ID</p>
              <p className="font-mono font-bold text-gold">#{order.order_id}</p>
            </div>

            {/* Content based on action */}
            {(action === "ACCEPT" || action === "ASSIGN") && (
              <div className="space-y-4">
                {action === "ACCEPT" && (
                  <p className="text-sm text-muted">
                    You are about to accept this order. You can optionally
                    assign a rider now or do it later.
                  </p>
                )}

                <div>
                  <label className="block text-sm font-medium text-white !mb-2">
                    Assign Rider {action === "ACCEPT" && "(Optional)"}
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto !pr-2 custom-scrollbar">
                    {riders.map((rider) => (
                      <label
                        key={rider.id}
                        className={`flex items-center gap-3 !p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedRider === String(rider.id)
                            ? "bg-primary/20 border-primary"
                            : "bg-white/5 border-transparent hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name="rider"
                          value={rider.id}
                          checked={selectedRider === String(rider.id)}
                          onChange={(e) => setSelectedRider(e.target.value)}
                          className="hidden"
                        />
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Bike className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">
                            {rider.first_name}{" "}
                            {rider.last_name || rider.username}
                          </p>
                          <p className="text-xs text-muted">Active</p>
                        </div>
                        {selectedRider === String(rider.id) && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </label>
                    ))}
                    {riders.length === 0 && (
                      <p className="text-sm text-muted text-center !py-4">
                        No available riders found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {action === "STATUS" && (
              <div>
                <label className="block text-sm font-medium text-white !mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl !px-4 !py-3 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select Status</option>
                  {validStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Note Field */}
            {action !== "ASSIGN" && (
              <div>
                <label className="block text-sm font-medium text-white !mb-2">
                  Note (Internal)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl !px-4 !py-3 text-white text-sm focus:outline-none focus:border-primary min-h-[80px]"
                  placeholder="Add a note..."
                />
              </div>
            )}
          </div>

          <div className="!p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="!px-4 !py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                (action === "ASSIGN" && !selectedRider) ||
                (action === "STATUS" && !selectedStatus)
              }
              className="!px-4 !py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
