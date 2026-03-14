"use client";

import { motion } from "framer-motion";
import { Bell, Sparkles, Zap } from "lucide-react";

export default function SpotlightPage() {
  return (
    <div className="page-content">
      {/* Header */}
      <section style={{ padding: "32px 0 24px" }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p
              className="text-label text-primary"
              style={{ marginBottom: "8px", letterSpacing: "0.1em" }}
            >
              Advertisement Platform
            </p>
            <h1 className="text-title text-gradient">Spotlight</h1>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card text-center bg-white"
            style={{ padding: "80px 24px" }}
          >
            <div
              className="icon-box shadow-xl shadow-primary/20"
              style={{
                width: 72,
                height: 72,
                margin: "0 auto 32px",
                borderRadius: "24px",
                background: "var(--primary-soft)",
                color: "var(--primary)",
              }}
            >
              <Zap className="w-8 h-8 fill-current" />
            </div>

            <p className="!px-4 !py-1.5! bg-amber-50 text-amber-600 rounded-full text-[10px] font-black tracking-[0.2em] uppercase inline-block !mb-4 border border-amber-100">
              Feature En Route
            </p>

            <h2 className="text-3xl font-black text-slate-900 !mb-4">
              Advert Space <span className="text-primary italic">Coming Soon</span>
            </h2>

            <p
              className="text-body text-slate-500"
              style={{ maxWidth: 400, margin: "0 auto 40px" }}
            >
             A platform where our clients can also display their products and services.
            </p>

            <button className="btn btn-primary btn-lg shadow-xl shadow-primary/25 !px-10!">
              <Bell className="w-4 h-4 !mr-2" />
              Notify Me
            </button>

            <div className="!mt-12 flex items-center justify-center gap-6 opacity-20 hover:opacity-100 transition-opacity">
              <Sparkles className="w-6 h-6 text-primary" />
              <Zap className="w-6 h-6 text-secondary" />
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
