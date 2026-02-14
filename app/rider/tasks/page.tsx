"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Package, Clock, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";

type TaskStatus = "ASSIGNED" | "ACCEPTED" | "PICKED_UP" | "READY" | "DELIVERED";

interface Task {
  _id: string;
  order_id: string;
  customer_name: string;
  phone_number: string;
  total_price?: number;
  status: TaskStatus;
  pickup_location?: {
    address?: string;
  };
  delivery_location?: {
    address?: string;
  };
}

export default function RiderTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data: Task[] = await apiRequest("/logistics/rider/orders/");
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch rider tasks:", error);
      alert("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAccept = async (orderId: string) => {
    setAcceptingOrderId(orderId);
    try {
      await apiRequest(`/logistics/rider/accept/${orderId}/`, { method: "POST" });
      await fetchTasks();
    } catch (error) {
      console.error("Failed to accept task:", error);
      alert("Failed to accept task.");
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const availableTasks = tasks
    .filter((task) => task.status === "ASSIGNED")
    .filter((task) => {
      const location =
        task.pickup_location?.address || task.delivery_location?.address || "";
      const query = searchTerm.toLowerCase();
      return (
        task.order_id.toLowerCase().includes(query) ||
        task.customer_name.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query)
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Available Tasks</h1>
        <div className="relative w-full md:w-72 !mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!pl-10 !pr-4 !py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary outline-none text-sm w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center !py-12 text-muted">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : availableTasks.length === 0 ? (
        <div className="text-center !py-12 text-muted card border-dashed">
          No assigned tasks available right now.
        </div>
      ) : (
        <div className="grid gap-4">
          {availableTasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card !p-5 border-white/5 bg-white/2 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">#{task.order_id}</span>
                    <span className="badge badge-accent !py-0.5">Pickup</span>
                  </div>
                  <div className="flex flex-col text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {task.pickup_location?.address ||
                          task.delivery_location?.address ||
                          "Location not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{task.customer_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:!pt-0 border-t md:border-t-0 border-white/5">
                <div className="text-right">
                  <div className="text-sm text-muted">Order Value</div>
                  <div className="text-xl font-bold text-green-400">
                    {formatMoney(task.total_price ?? 0)}
                  </div>
                </div>
                <button
                  onClick={() => handleAccept(task.order_id)}
                  disabled={acceptingOrderId === task.order_id}
                  className="btn btn-primary btn-sm !px-6 disabled:opacity-60"
                >
                  {acceptingOrderId === task.order_id ? "Accepting..." : "Accept"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
