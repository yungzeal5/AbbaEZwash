"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";

export default function SpotlightPage() {
  return (
    <div className="page-content">
      {/* Header */}
      <section style={{ padding: "24px 0" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-label" style={{ marginBottom: "8px" }}>
              Exclusive Offers
            </p>
            <h1 className="text-title">Spotlight</h1>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card text-center"
            style={{ padding: "64px 24px" }}
          >
            <div
              className="icon-box"
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 24px",
                borderRadius: 16,
              }}
            >
              <Bell className="w-6 h-6" strokeWidth={1.5} />
            </div>

            <h2 className="text-title" style={{ marginBottom: "12px" }}>
              Coming Soon
            </h2>
            <p
              className="text-body"
              style={{ maxWidth: 320, margin: "0 auto 32px" }}
            >
              Exclusive offers and promotions will appear here. Stay tuned for
              special deals.
            </p>

            <button className="btn btn-primary">
              <Bell className="w-4 h-4" />
              Notify Me
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
