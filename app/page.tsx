"use client";

import { motion } from "framer-motion";
import { ArrowRight, Trophy, Clock, Truck } from "lucide-react";
import Link from "next/link";
import Typewriter from "@/components/ui/Typewriter";

const features = [
  {
    icon: Trophy,
    title: "Premium Care",
    desc: "Expert handling for all fabrics",
  },
  {
    icon: Clock,
    title: "Fast Service",
    desc: "24-48 hour turnaround",
  },
  {
    icon: Truck,
    title: "Free Pickup",
    desc: "We come to your door",
  },
];

const taglines = [
  "Luxury, quietly executed.",
  "Your time, handled with care.",
  "For wardrobes that command respect.",
  "Time saved. Standards raised.",
];

export default function HomePage() {
  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="section" style={{ paddingTop: "80px" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            <p className="text-label" style={{ marginBottom: "16px" }}>
              Luxury Laundry Service
            </p>

            <h1 className="text-display" style={{ marginBottom: "16px" }}>
              Effortless care for your finest
            </h1>

            {/* Typewriter Tagline */}
            <div
              style={{
                minHeight: "2.5rem",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typewriter
                phrases={taglines}
                typingSpeed={70}
                deletingSpeed={40}
                pauseDuration={2000}
                className="text-body"
              />
            </div>

            <p className="text-body" style={{ marginBottom: "32px" }}>
              Premium garment care that respects your time and your wardrobe.
            </p>

            <div
              className="flex items-center justify-center gap-3"
              style={{ flexWrap: "wrap" }}
            >
              <Link href="/orders">
                <button className="btn btn-primary btn-lg">
                  Place Order
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/history">
                <button className="btn btn-secondary btn-lg">
                  Track Order
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p
              className="text-label text-center"
              style={{ marginBottom: "12px" }}
            >
              Why Choose Us
            </p>
            <h2
              className="text-title text-center"
              style={{ marginBottom: "40px" }}
            >
              The Abba difference
            </h2>

            <div className="grid-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card text-center"
                >
                  <div
                    className="icon-box"
                    style={{
                      margin: "0 auto 16px",
                      background: "var(--bg-elevated)",
                    }}
                  >
                    <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-heading" style={{ marginBottom: "8px" }}>
                    {feature.title}
                  </h3>
                  <p className="text-small">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="card text-center"
            style={{ padding: "48px 24px" }}
          >
            <h2 className="text-title" style={{ marginBottom: "12px" }}>
              Ready to get started?
            </h2>
            <p
              className="text-body"
              style={{
                marginBottom: "24px",
                maxWidth: "400px",
                margin: "0 auto 24px",
              }}
            >
              Join thousands who trust us with their garments.
            </p>
            <Link href="/orders">
              <button className="btn btn-primary">
                Start Your First Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
