"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Loader2,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Complaint {
  _id: string;
  order_id: string;
  username: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  resolution?: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await apiRequest("/users/superadmin/complaints/");
        setComplaints(data);
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleResolve = async (complaint: Complaint) => {
    const resolution = window.prompt(
      `Add a resolution note for complaint #${complaint.order_id}`,
    );
    if (!resolution) return;

    setResolvingId(complaint._id);
    try {
      await apiRequest("/users/superadmin/complaints/", {
        method: "POST",
        body: JSON.stringify({
          complaint_id: complaint._id,
          resolution,
        }),
      });

      setComplaints((prev) =>
        prev.map((item) =>
          item._id === complaint._id
            ? { ...item, status: "RESOLVED", resolution }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to resolve complaint:", error);
      alert("Failed to resolve complaint.");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Customer Complaints
        </h1>
        <p className="text-muted">Monitor and resolve service issues.</p>
      </div>

      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="py-12 text-center card glass-panel border-dashed border-2 border-white/5 opacity-50">
            <p className="text-muted">No complaints found.</p>
          </div>
        ) : (
          complaints.map((complaint, i) => (
            <motion.div
              key={complaint._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card glass-panel p-6 hover:border-white/20 transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`p-3 rounded-xl ${complaint.status === "RESOLVED" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                  >
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-white text-lg">
                        {complaint.subject || "No Subject"}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                          complaint.status === "RESOLVED"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted mb-4 font-mono">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {complaint.username}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                      <span>Order: #{complaint.order_id}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
                      {complaint.description}
                    </p>

                    {complaint.resolution && (
                      <div className="mt-4 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                        <div className="flex items-center gap-2 mb-2 text-green-400 font-bold text-xs uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" />
                          Resolution
                        </div>
                        <p className="text-sm text-green-400/80 italic">
                          {complaint.resolution}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {complaint.status !== "RESOLVED" && (
                  <button
                    onClick={() => handleResolve(complaint)}
                    disabled={resolvingId === complaint._id}
                    className="btn btn-sm btn-primary disabled:opacity-60"
                  >
                    {resolvingId === complaint._id ? "Resolving..." : "Resolve"}
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
