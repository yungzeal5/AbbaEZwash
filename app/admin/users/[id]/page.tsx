"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, MapPin, Mail, ShoppingBag } from "lucide-react";

interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  location: { address: string };
  date_joined: string;
}

interface UserOrder {
  _id: string;
  order_id: string;
  total_price: number;
  status: string;
  created_at: string;
  items: Array<Record<string, unknown>>;
  user_id?: string;
  customer_name?: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // We need a backend endpoint for getting user details by ID for admins
        // For now simulating or using existing logic if available.
        // Assuming a new endpoint /users/admin/users/<id>/
        const userData = await apiRequest(`/users/superadmin/users/${params.id}/`);
        // Note: Reusing superadmin endpoint which likely returns needed info
        setUser(userData);

        // Fetch user orders? Currently backend filter filters by logged in user.
        // Need to update backend or filter strictly on frontend from ALL orders if no endpoint.
        // Ideally: /orders/admin/user/<id>/
        // For now: Fetching ALL admin orders and filtering (inefficient but works for MVP)
        const allOrders: UserOrder[] = await apiRequest("/orders/admin/all/");
        const userOrders = allOrders.filter(
          (o) => o.user_id === String(params.id) || o.customer_name === userData.username,
        );
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to fetch user details", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchData();
  }, [params.id]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (!user) return <div className="text-white">User not found</div>;

  return (
    <div className="!pb-20">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-white !mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* User Profile Card */}
      <div className="card glass-panel !p-8 !mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white">
              {user.first_name?.[0] || user.username[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white !mb-1">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-primary font-mono text-sm">{user.role}</p>
              <p className="text-muted text-sm !mt-1">
                Joined {new Date(user.date_joined).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`!px-3 !py-1 rounded-full text-xs font-bold ${user.role === "CUSTOMER" ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}
            >
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 !mt-8 !pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 text-sm text-muted">
            <Mail className="w-4 h-4" />
            {user.email}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Phone className="w-4 h-4" />
            {user.phone_number || "No phone"}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <MapPin className="w-4 h-4" />
            {user.location?.address || "No address"}
          </div>
        </div>
      </div>

      {/* User Orders */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gold" />
          Order History
        </h2>

        {orders.length === 0 ? (
          <p className="text-muted">No orders found for this user.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={order._id}
                className="card glass-panel !p-4 !flex items-center justify-between"
              >
                <div>
                  <p className="font-mono text-xs text-gold !mb-1">#{order.order_id}</p>
                  <p className="text-white font-bold">
                    {formatMoney(order.total_price)}
                    <span className="text-muted font-normal text-sm !ml-2">
                      ({order.items.length} items)
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted block !mb-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="badge badge-default bg-white/5">{order.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
