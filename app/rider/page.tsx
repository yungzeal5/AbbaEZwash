"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Bike,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User as UserIcon,
  Power,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { apiRequest } from "@/lib/api";

type TaskStatus = "ASSIGNED" | "ACCEPTED" | "PICKED_UP" | "DELIVERED" | "READY";

interface Task {
  order_id: string;
  customer_name: string;
  customer_id: string;
  phone_number: string;
  pickup_location?: {
    address?: string;
  };
  delivery_location?: {
    address?: string;
  };
  type: "Pickup" | "Deliver";
  status: TaskStatus;
}

export default function RiderDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(user?.is_online || false);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsOnline(user.is_online);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const data = await apiRequest("/logistics/rider/orders/");
      setActiveTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchTasks();
    }
  }, [isOnline]);

  const toggleOnline = async () => {
    try {
      const nextState = !isOnline;
      await apiRequest("/logistics/rider/status-toggle/", {
        method: "POST",
        body: JSON.stringify({ is_online: nextState }),
      });
      setIsOnline(nextState);
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const updateTaskStatus = async (
    orderId: string,
    currentStatus: TaskStatus,
  ) => {
    try {
      let endpoint = "";
      if (currentStatus === "ASSIGNED")
        endpoint = `/logistics/rider/accept/${orderId}/`;
      else if (currentStatus === "ACCEPTED")
        endpoint = `/logistics/rider/pickup/${orderId}/`;
      else if (currentStatus === "READY")
        endpoint = `/logistics/rider/deliver/${orderId}/`;

      if (endpoint) {
        await apiRequest(endpoint, { method: "POST" });
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const getStatusAction = (status: TaskStatus) => {
    switch (status) {
      case "ASSIGNED":
        return "Accept Assignment";
      case "ACCEPTED":
        return "Mark as Picked Up";
      case "READY":
        return "Mark as Delivered";
      case "PICKED_UP":
        return "Awaiting Processing";
      default:
        return "Completed";
    }
  };

  return (
    <div className="relative !pb-20 !pt-2.5 !mr-3 !ml-3">
      {/* Toggle Section */}
      <div
        className={`transition-all duration-500 ease-in-out ${isOnline ? "sticky top-0 z-50 pt-4 pb-4 bg-background/80 backdrop-blur-md border-b border-white/5" : "py-20 flex flex-col items-center justify-center"}`}
      >
        <motion.div layout className="flex flex-col items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleOnline}
            className={`relative group flex items-center gap-3 !px-7 !py-3 rounded-full font-bold text-lg transition-all ${
              isOnline
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                : "bg-white/5 text-muted hover:bg-white/10"
            }`}
          >
            <Power className={`w-6 h-6 ${isOnline ? "animate-pulse" : ""}`} />
            <span>{isOnline ? "You are Online" : "Go Online"}</span>

            {!isOnline && (
              <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/20 transition-colors" />
            )}
          </motion.button>

          {!isOnline && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted text-sm"
            >
              Toggle to start receiving assignments
            </motion.p>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 space-y-8"
          >
            {/* Active Assignments */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">New Assignments</h2>
                <span className="badge badge-accent">
                  {activeTasks.filter((t) => t.status !== "DELIVERED").length}{" "}
                  Active
                </span>
              </div>

              <div className="grid gap-4">
                {activeTasks.map((task) => (
                  <motion.div
                    key={task.order_id}
                    layout
                    className={`card !p-6 border-white/5 bg-white/2 space-y-4 hover:border-primary/30 transition-colors ${task.status === "DELIVERED" ? "opacity-50 grayscale" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.type === "Pickup" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}
                        >
                          <Bike className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {task.customer_name}
                          </h3>
                          <p className="text-xs text-muted font-mono uppercase tracking-wider">
                            {task.order_id} • {task.customer_id}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`badge ${task.status === "ASSIGNED" ? "badge-accent" : "bg-primary/20 text-primary"}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 !py-2">
                      <div className="flex items-center gap-3 text-sm text-secondary">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>
                          {task.pickup_location?.address ||
                            task.delivery_location?.address ||
                            "Location not set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-secondary">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>{task.phone_number}</span>
                      </div>
                    </div>

                    <div className="!pt-4 border-t border-white/5">
                      {task.status !== "DELIVERED" ? (
                        <button
                          onClick={() =>
                            updateTaskStatus(task.order_id, task.status)
                          }
                          className="btn btn-primary w-full flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={task.status === "PICKED_UP"}
                        >
                          {getStatusAction(task.status)}
                          {task.status !== "PICKED_UP" && (
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          )}
                        </button>
                      ) : (
                        <div className="text-center !py-2 text-green-400 font-medium flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Assignment Completed
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {activeTasks.length === 0 && !isLoading && (
                  <div className="text-center !py-12 text-muted">
                    No active assignments found.
                  </div>
                )}
                {isLoading && (
                  <div className="text-center !py-12 text-muted animate-pulse">
                    Loading assignments...
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOnline && (
        <div className="!mt-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center !mx-auto">
            <Clock className="w-10 h-10 text-muted/30" />
          </div>
          <h3 className="text-lg font-medium text-muted">
            Awaiting your availability
          </h3>
          <p className="max-w-xs !mx-auto text-sm text-muted/50">
            Once you go online, your pending assignments will appear here
            automatically.
          </p>
        </div>
      )}
    </div>
  );
}
