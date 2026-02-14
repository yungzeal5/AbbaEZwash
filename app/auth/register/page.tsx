"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    role: "CUSTOMER",
    location: { address: "" },
    referral_code: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(formData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to register. Please check your details.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div
      className="page-content flex items-center justify-center"
      style={{ minHeight: "90vh", padding: "60px 0" }}
    >
      <div className="container" style={{ maxWidth: "550px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card"
          style={{
            padding: "48px 40px",
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="text-center" style={{ marginBottom: "40px" }}>
            <div
              className="icon-box"
              style={{
                margin: "0 auto 20px",
                background: "var(--primary-soft)",
                color: "var(--primary)",
              }}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-title" style={{ letterSpacing: "0.05em" }}>
              Create Account
            </h1>
            <p className="text-caption" style={{ color: "var(--text-muted)" }}>
              Join Abba EZWash for a premium cleaning experience
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-small"
                style={{
                  padding: "12px",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  borderRadius: "4px",
                  borderLeft: "2px solid #ef4444",
                }}
              >
                {error}
              </motion.div>
            )}

            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  className="text-label"
                  style={{ color: "var(--primary)", fontSize: "0.6rem" }}
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="zealous"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                  <User
                    className="absolute left-0 top-[14px]"
                    style={{
                      width: "18px",
                      height: "18px",
                      color: "var(--primary)",
                    }}
                  />
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  className="text-label"
                  style={{ color: "var(--gold)", fontSize: "0.6rem" }}
                >
                  Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    className="input"
                    style={{ paddingLeft: "36px" }}
                    placeholder="+233..."
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                  />
                  <Phone
                    className="absolute left-0 top-[14px]"
                    style={{
                      width: "18px",
                      height: "18px",
                      color: "var(--primary)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                className="text-label"
                style={{ color: "var(--gold)", fontSize: "0.6rem" }}
              >
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <Mail
                  className="absolute left-0 top-[14px]"
                  style={{
                    width: "18px",
                    height: "18px",
                    color: "var(--primary)",
                  }}
                />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                className="text-label"
                style={{ color: "var(--gold)", fontSize: "0.6rem" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <Lock
                  className="absolute left-0 top-[14px]"
                  style={{
                    width: "18px",
                    height: "18px",
                    color: "var(--primary)",
                  }}
                />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                className="text-label"
                style={{ color: "var(--gold)", fontSize: "0.6rem" }}
              >
                Pickup Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="Enter your location"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { address: e.target.value },
                    })
                  }
                />
                <MapPin
                  className="absolute left-0 top-[14px]"
                  style={{
                    width: "18px",
                    height: "18px",
                    color: "var(--primary)",
                  }}
                />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                className="text-label"
                style={{ color: "var(--gold)", fontSize: "0.6rem" }}
              >
                Referral Code (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="Enter 6-digit code"
                  value={formData.referral_code}
                  onChange={(e) =>
                    setFormData({ ...formData, referral_code: e.target.value })
                  }
                  maxLength={6}
                />
                <UserPlus
                  className="absolute left-0 top-[14px]"
                  style={{
                    width: "18px",
                    height: "18px",
                    color: "var(--primary)",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{
                marginTop: "16px",
                height: "52px",
                background: "var(--primary)",
                color: "white",
                fontWeight: "600",
                letterSpacing: "0.1em",
                borderRadius: "4px",
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <p
            className="text-center text-small"
            style={{ marginTop: "32px", color: "var(--text-muted)" }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
