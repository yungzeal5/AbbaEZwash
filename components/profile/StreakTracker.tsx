"use client";

import { motion } from "framer-motion";
import { Check, Gift } from "lucide-react";

interface StreakTrackerProps {
  count: number; // 0 to 5
}

export default function StreakTracker({ count }: StreakTrackerProps) {
  const steps = [1, 2, 3, 4, 5, 6];
  const progress = Math.min(count, 5); // Count tracks washes (0-5). 5 complete means reward ready at step 6.

  return (
    <div
      className="card card-gold"
      style={{
        padding: "20px",
        marginTop: "24px",
        background:
          "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(26, 86, 219, 0.05) 100%)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-body font-bold text-primary">Loyalty Streak</h3>
          <p className="text-caption">
            {count >= 5
              ? "Congratulations! Your next wash is FREE!"
              : `${5 - count} more washes until your free reward`}
          </p>
        </div>
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            background: count >= 5 ? "var(--gold)" : "rgba(255,255,255,0.1)",
            borderRadius: "50%",
          }}
        >
          <Gift
            className={`w-5 h-5 ${count >= 5 ? "text-black" : "text-muted"}`}
          />
        </div>
      </div>

      <div
        className="relative flex justify-between items-center"
        style={{ padding: "0 10px" }}
      >
        {/* Progress Line Background */}
        <div
          className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0"
          style={{ borderRadius: "2px" }}
        />

        {/* Active Progress Line */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${(Math.max(0, count) / 5) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ borderRadius: "2px" }}
        />

        {steps.map((step, index) => {
          const isRewardStep = step === 6;
          const isCompleted = step <= count;
          // For the reward step, it's 'active' if count is 5 (5 washes done, 6th is free)
          const isRewardActive = isRewardStep && count >= 5;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  width: isRewardStep ? 40 : 32,
                  height: isRewardStep ? 40 : 32,
                  borderRadius: "50%",
                  background: isRewardActive
                    ? "var(--gold)"
                    : isCompleted
                      ? "var(--primary)"
                      : "var(--background)",
                  border: isRewardActive
                    ? "2px solid var(--gold)"
                    : isCompleted
                      ? "2px solid var(--primary)"
                      : "2px solid rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    isCompleted || isRewardActive
                      ? "0 4px 12px rgba(26, 86, 219, 0.4)"
                      : "none",
                  marginTop: isRewardStep ? -4 : 0,
                }}
              >
                {isRewardStep ? (
                  <span
                    className={`text-[10px] font-bold ${isRewardActive ? "text-black" : "text-muted"}`}
                  >
                    FREE
                  </span>
                ) : isCompleted ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                ) : (
                  <span
                    className="text-xs font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {step}
                  </span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
