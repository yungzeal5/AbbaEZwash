"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
    } catch (err: any) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="page-content flex items-center justify-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="container" style={{ maxWidth: "450px" }}>
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
              <LogIn className="w-5 h-5" />
            </div>
            <h1 className="text-title" style={{ letterSpacing: "0.05em" }}>
              Welcome Back
            </h1>
            <p className="text-caption" style={{ color: "var(--text-muted)" }}>
              Luxury laundry care is just a sign-in away
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
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
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
                style={{ color: "var(--primary)", fontSize: "0.6rem" }}
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
                  SIGN IN
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <p
            className="text-center text-small"
            style={{ marginTop: "32px", color: "var(--text-muted)" }}
          >
            New to Abba?{" "}
            <Link
              href="/auth/register"
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
