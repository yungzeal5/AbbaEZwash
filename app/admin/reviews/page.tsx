"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Star, Loader2, User, Calendar, MessageSquare } from "lucide-react";

interface Review {
  _id: string;
  user_id: string;
  username: string;
  order_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiRequest("/users/superadmin/reviews/");
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

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
        <h1 className="text-3xl font-bold text-white mb-1">Customer Reviews</h1>
        <p className="text-muted">Monitor feedback and service ratings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-full py-12 text-center card glass-panel border-dashed border-2 border-white/5 opacity-50">
            <p className="text-muted">No reviews found yet.</p>
          </div>
        ) : (
          reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card glass-panel p-6 flex flex-col group hover:border-white/20 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{review.username}</p>
                    <p className="text-[10px] text-muted font-mono">
                      #{review.order_id}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= review.rating ? "text-gold fill-current" : "text-white/10"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm text-white/80 italic leading-relaxed mb-4">
                  &ldquo;{review.comment || "No comment provided."}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-muted uppercase tracking-widest font-bold">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
                <span>Verified Purchase</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
