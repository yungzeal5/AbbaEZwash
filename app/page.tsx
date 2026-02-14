"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Trophy, Clock, Truck } from "lucide-react";
import Link from "next/link";
import Typewriter from "@/components/ui/Typewriter";
import ReviewsSection from "@/components/ui/ReviewsSection";

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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="relative min-h-[99vh] flex items-center overflow-hidden">
        {/* Background Video with Parallax */}
        <motion.div
          style={{ y }}
          className="absolute inset-x-0 -top-20 -bottom-20 z-0 h-[calc(100%+160px)]"
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
            <source src="/BG/BGWASH.mp4" type="video/mp4" />
          </video>
          {/* Enhanced Overlay for readability */}
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80" />
          {/* Subtle gold shimmer overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_100%)]" />
        </motion.div>

        <div className="container relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-label"
              style={{ marginBottom: "16px", color: "var(--gold)" }}
            >
              Luxury Laundry Service
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-display"
              style={{ marginBottom: "20px" }}
            >
              Effortless care for your finest
            </motion.h1>

            {/* Typewriter Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                minHeight: "2.5rem",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-primary)",
                fontWeight: 500,
              }}
            >
              <Typewriter
                phrases={taglines}
                typingSpeed={70}
                deletingSpeed={40}
                pauseDuration={2000}
                className="text-body"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-body"
              style={{ marginBottom: "40px", fontSize: "1.1rem" }}
            >
              Premium garment care that respects your time and your wardrobe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-4"
              style={{ flexWrap: "wrap" }}
            >
              <Link href="/orders">
                <button className="btn btn-gold btn-lg group">
                  Place Order
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/history">
                <button className="btn btn-secondary btn-lg">Track Order</button>
              </Link>
            </motion.div>
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
            <p className="text-label text-center" style={{ marginBottom: "12px" }}>
              Why Choose Us
            </p>
            <h2 className="text-title text-center" style={{ marginBottom: "40px" }}>
              ABBA EZWASH
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

      {/* Reviews Section */}
      <ReviewsSection />
    </div>
  );
}
