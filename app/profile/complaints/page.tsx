"use client";

import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, ChevronLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ComplaintsPage() {
  const { loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    order_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiRequest("/users/complaint/", {
        method: "POST",
        body: formData,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit complaint. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-content bg-slate-50 min-h-screen">
      <div className="container max-w-2xl !px-4 !py-8">
        {/* Header */}
        <div className="flex items-center gap-4 !mb-8">
          <button
            onClick={() => router.back()}
            className="!p-3 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-primary transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Submit Complaint</h1>
            <p className="text-sm font-medium text-slate-500">We&apos;re here to listen and help</p>
          </div>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] !p-10 text-center shadow-xl border border-slate-100"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto !mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 !mb-2">Message Received!</h2>
            <p className="text-slate-500 font-medium">
              Your complaint has been logged. Our concierge team will review it and get back to you
              shortly.
            </p>
            <div className="!mt-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 !mt-2">
                Redirecting to profile...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] !p-8 shadow-xl border border-slate-100"
          >
            <div className="flex items-center gap-4 !mb-8 !p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-primary leading-relaxed">
                Your satisfaction is our priority. Please provide details about your issue below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="!p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                  Subject of Issue
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delayed Delivery, Item Quality"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                  Order ID (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    #
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 5FD82"
                    value={formData.order_id}
                    onChange={(e) =>
                      setFormData({ ...formData, order_id: e.target.value.toUpperCase() })
                    }
                    className="w-full !pl-10 !pr-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Tell us exactly what happened so we can make it right..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900 placeholder:text-slate-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary flex items-center justify-center gap-3 py-5! rounded-2xl shadow-xl shadow-primary/20 font-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message to Support</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        <div className="!mt-12 text-center">
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 !mb-2">
            Need immediate assistance?
          </p>
          <a href="tel:0543955261" className="text-primary font-black text-sm hover:underline">
            Call Helpline: 0543955261
          </a>
        </div>
      </div>
    </div>
  );
}
