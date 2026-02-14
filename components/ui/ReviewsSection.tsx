"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, User } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface Review {
  _id: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await apiRequest("/orders/reviews/public/", { requiresAuth: false });
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="section py-20 bg-black/40">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-label text-gold mb-6">Customer Experiences</p>
          <h2 className="text-display !mb-6">What Our Clients Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-gold p-8 flex flex-col h-full rounded-2xl"
            >
              <div className="flex gap-1 !mt-3 !ml-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.rating ? "fill-current text-gold" : "text-white/10"}
                  />
                ))}
              </div>

              <p className="text-body italic mb-8 grow !ml-2">"{review.comment}"</p>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="w-10 h-10 !mt-3 !ml-3 !mb-2 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-heading font-bold text-white leading-tight">
                    {review.username}
                  </h4>
                  <p className="text-caption !mb-2">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
