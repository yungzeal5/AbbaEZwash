"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Circle,
  MapPin,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

interface Rider {
  id: number;
  username: string;
  email: string;
  is_online: boolean;
  active_tasks: number;
  custom_id: string;
}

interface PendingOrder {
  _id?: string;
  order_id: string;
  customer_name: string;
  status: string;
  pickup_location?: {
    address?: string;
  };
  delivery_location?: {
    address?: string;
  };
  assigned_rider_id?: number;
}

export default function AdminRiders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentSelections, setAssignmentSelections] = useState<
    Record<string, string>
  >({});
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [newRider, setNewRider] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
  });

  const fetchData = async () => {
    try {
      const ridersData = await apiRequest("/logistics/admin/riders/");
      setRiders(ridersData);

      // Fetch unassigned orders (orders without assigned_rider_id)
      const ordersData: PendingOrder[] = await apiRequest("/orders/admin/all/"); // Assuming this exists or using a filter
      const unassigned = ordersData.filter(
        (o) =>
          !o.assigned_rider_id &&
          !["DELIVERED", "COMPLETED", "CANCELLED"].includes(o.status),
      );
      setPendingOrders(unassigned);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/logistics/admin/riders/register/", {
        method: "POST",
        body: JSON.stringify(newRider),
      });
      setIsRegistering(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert("Registration failed: " + errorMessage);
    }
  };

  const handleAssign = async (orderId: string, riderId: number) => {
    setAssigningOrderId(orderId);
    try {
      await apiRequest(`/logistics/admin/assign/${orderId}/`, {
        method: "POST",
        body: JSON.stringify({ rider_id: riderId }),
      });
      setAssignmentSelections((prev) => ({ ...prev, [orderId]: "" }));
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert("Assignment failed: " + errorMessage);
    } finally {
      setAssigningOrderId(null);
    }
  };

  const onlineCount = riders.filter((r) => r.is_online).length;
  const filteredRiders = riders.filter((rider) => {
    const query = searchTerm.toLowerCase();
    return (
      rider.username.toLowerCase().includes(query) ||
      rider.custom_id.toLowerCase().includes(query) ||
      rider.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 !pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold !mb-2">Rider Management</h1>
          <p className="text-muted">
            Manage your delivery fleet and assign new tasks.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="!px-4 !py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-400">
              {onlineCount} Riders Online
            </span>
          </div>
          <button
            onClick={() => setIsRegistering(true)}
            className="btn btn-gold flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Register Rider
          </button>
        </div>
      </div>

      {/* Registration Modal */}
      {isRegistering && (
        <div className="fixed inset-0 z-100 flex items-center justify-center !p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-md !p-8 bg-background border-white/10"
          >
            <h2 className="text-2xl font-bold !mb-6">Register New Rider</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                required
                className="input bg-white/5 border-white/10 !px-4"
                onChange={(e) =>
                  setNewRider({ ...newRider, username: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="input bg-white/5 border-white/10 !px-4"
                onChange={(e) =>
                  setNewRider({ ...newRider, email: e.target.value })
                }
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                className="input bg-white/5 border-white/10 !px-4"
                onChange={(e) =>
                  setNewRider({ ...newRider, phone_number: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="input bg-white/5 border-white/10 !px-4"
                onChange={(e) =>
                  setNewRider({ ...newRider, password: e.target.value })
                }
              />
              <div className="flex gap-3 !pt-4">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold flex-1">
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 !mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search riders by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input !pl-10 bg-white/5 border-white/10 rounded-xl"
          />
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRiders.map((rider) => (
          <motion.div
            key={rider.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card !p-6 border-white/5 bg-white/2 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between !mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {rider.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">{rider.username}</h3>
                  <p className="text-xs text-muted font-mono">
                    {rider.custom_id}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 !px-2 !py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rider.is_online ? "bg-green-500/10 text-green-400" : "bg-white/5 text-muted"}`}
              >
                <Circle
                  className={`w-2 h-2 fill-current ${rider.is_online ? "animate-pulse" : ""}`}
                />
                {rider.is_online ? "Online" : "Offline"}
              </div>
            </div>

            <div className="space-y-3 !py-4 border-y border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Status</span>
                <span
                  className={
                    rider.active_tasks > 0
                      ? "text-primary font-medium"
                      : "text-muted"
                  }
                >
                  {rider.active_tasks > 0
                    ? `${rider.active_tasks} Active Tasks`
                    : "Ready for assignment"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Email</span>
                <span className="text-white/80">{rider.email}</span>
              </div>
            </div>

            <div className="!pt-4">
              <div className="text-xs text-muted !mb-2 uppercase font-bold tracking-widest">
                Quick Assign
              </div>
              <select
                className="input text-sm bg-white/5 border-white/10 !px-3 !py-2 rounded-lg"
                onChange={(e) =>
                  e.target.value && handleAssign(e.target.value, rider.id)
                }
                value=""
              >
                <option value="" disabled>
                  Select Pending Order
                </option>
                {pendingOrders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>
                    {order.order_id} - {order.customer_name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        ))}
        {filteredRiders.length === 0 && !isLoading && (
          <div className="col-span-full !py-12 text-center text-muted card border-dashed">
            No riders registered yet.
          </div>
        )}
      </div>

      {/* Task Assignment Section */}
      <section className="!mt-12 space-y-6">
        <h2 className="text-xl font-bold">Pending Assignments</h2>
        <div className="card !p-0 overflow-hidden border-white/5 bg-white/2">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted font-bold">
              <tr>
                <th className="!px-6 !py-4">Order ID</th>
                <th className="!px-6 !py-4">Type</th>
                <th className="!px-6 !py-4">Customer</th>
                <th className="!px-6 !py-4">Location</th>
                <th className="!px-6 !py-4">Assign To</th>
                <th className="!px-6 !py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {pendingOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="!px-6 !py-8 text-center text-muted">
                    No pending assignments.
                  </td>
                </tr>
              ) : (
                pendingOrders.map((order) => {
                  const selectedRiderId = assignmentSelections[order.order_id] || "";
                  const location =
                    order.pickup_location?.address ||
                    order.delivery_location?.address ||
                    "Location not set";
                  const orderType = ["PICKED_UP", "READY"].includes(order.status)
                    ? "Deliver"
                    : "Pickup";

                  return (
                    <tr
                      key={order._id || order.order_id}
                      className="hover:bg-white/1 transition-colors"
                    >
                      <td className="!px-6 !py-4 font-mono">#{order.order_id}</td>
                      <td className="!px-6 !py-4">
                        <span
                          className={`badge ${orderType === "Pickup" ? "badge-accent" : "bg-purple-500/10 text-purple-400"}`}
                        >
                          {orderType}
                        </span>
                      </td>
                      <td className="!px-6 !py-4">{order.customer_name}</td>
                      <td className="!px-6 !py-4 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted" />
                        <span>{location}</span>
                      </td>
                      <td className="!px-6 !py-4">
                        <select
                          value={selectedRiderId}
                          onChange={(e) =>
                            setAssignmentSelections((prev) => ({
                              ...prev,
                              [order.order_id]: e.target.value,
                            }))
                          }
                          className="input text-sm bg-white/5 border-white/10 !px-3 !py-2 rounded-lg min-w-[170px]"
                        >
                          <option value="">Select rider</option>
                          {riders.map((rider) => (
                            <option key={rider.id} value={String(rider.id)}>
                              {rider.username} ({rider.custom_id})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="!px-6 !py-4">
                        <button
                          onClick={() =>
                            selectedRiderId &&
                            handleAssign(order.order_id, Number(selectedRiderId))
                          }
                          disabled={!selectedRiderId || assigningOrderId === order.order_id}
                          className="btn btn-primary btn-sm disabled:opacity-60"
                        >
                          {assigningOrderId === order.order_id ? "Assigning..." : "Assign"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
