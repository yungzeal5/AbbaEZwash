"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  LogOut,
  Shield,
  Fingerprint,
} from "lucide-react";
import StreakTracker from "@/components/profile/StreakTracker";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="text-center">
          <p className="text-body" style={{ color: "var(--primary)" }}>
            Loading luxury profile...
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (username: string) =>
    username.substring(0, 2).toUpperCase();

  return (
    <div className="page-content">
      {/* Header */}
      <section style={{ padding: "32px 0" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div
              className="avatar avatar-lg flex items-center justify-center bg-gold text-black font-bold text-xl"
              style={{
                position: "relative",
                overflow: "visible",
                background: "var(--primary)",
                color: "white",
                width: "80px",
                height: "80px",
              }}
            >
              {getInitials(user.username)}
              <div
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  padding: "4px",
                  background: "var(--bg-card)",
                  borderRadius: "50%",
                  border: "1px solid var(--gold)",
                }}
              >
                <Shield
                  className="w-3 h-3 text-gold"
                  style={{ color: "var(--gold)" }}
                />
              </div>
            </div>
            <div>
              <h1
                className="text-title"
                style={{ marginBottom: "4px", color: "var(--gold)" }}
              >
                {user.username}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className="badge badge-accent"
                  style={{
                    background: "var(--primary-soft)",
                    color: "var(--primary)",
                  }}
                >
                  {user.role}
                </span>
                <span
                  className="text-caption"
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Fingerprint className="w-3 h-3" />
                  ID: {user.custom_id || user.id}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Streak Tracker (Only for Customers) */}
          {user.role === "CUSTOMER" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <StreakTracker count={user.streak_count || 0} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Info */}
      <section style={{ paddingBottom: "24px" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{
              padding: 0,
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="list-item">
              <div
                className="icon-box icon-box-sm"
                style={{ color: "var(--primary)" }}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-caption">Email</p>
                <p
                  className="text-small truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.email}
                </p>
              </div>
            </div>
            <div className="list-item">
              <div
                className="icon-box icon-box-sm"
                style={{ color: "var(--primary)" }}
              >
                <Phone className="w-4 h-4" />
              </div>
              <div style={{ flex: 1 }}>
                <p className="text-caption">Phone</p>
                <p
                  className="text-small"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.phone_number || "Not provided"}
                </p>
              </div>
            </div>
            <div className="list-item">
              <div
                className="icon-box icon-box-sm"
                style={{ color: "var(--primary)" }}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div style={{ flex: 1 }}>
                <p className="text-caption">Default Address</p>
                <p
                  className="text-small"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.location?.address || "Not set"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Account Actions */}
      <section style={{ paddingBottom: "24px" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
            style={{
              padding: 0,
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <button
              className="list-item list-item-interactive w-full"
              style={{ justifyContent: "space-between" }}
            >
              <span
                className="text-small"
                style={{ color: "var(--text-primary)" }}
              >
                Privacy & Security
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="list-item list-item-interactive w-full"
              style={{ justifyContent: "space-between" }}
            >
              <span
                className="text-small"
                style={{ color: "var(--text-primary)" }}
              >
                Notification Settings
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Sign Out */}
      <section style={{ marginTop: "12px" }}>
        <div className="container">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={logout}
            className="btn w-full flex items-center justify-center gap-2"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              padding: "16px",
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>
      </section>
    </div>
  );
}
