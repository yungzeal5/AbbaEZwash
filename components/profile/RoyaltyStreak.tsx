"use client";

import { motion } from "framer-motion";
import { Gift, Droplets } from "lucide-react";
import Card from "@/components/ui/Card";

interface RoyaltyStreakProps {
  currentStreak: number; // 0-5
}

export default function RoyaltyStreak({ currentStreak }: RoyaltyStreakProps) {
  const streakDots = [1, 2, 3, 4, 5];
  const isFreeWashReady = currentStreak >= 5;

  return (
    <Card variant="glass" padding="lg" className="relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--primary-blue)]/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-[var(--accent-yellow)]" />
            Loyalty Rewards
          </h3>
          <p className="text-sm text-white/50 mt-1">
            {isFreeWashReady
              ? "🎉 Your free wash is ready!"
              : `${5 - currentStreak} more wash${
                  5 - currentStreak !== 1 ? "es" : ""
                } until your free wash!`}
          </p>
        </div>
      </div>

      {/* Streak Progress */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {streakDots.map((dot, index) => {
          const isCompleted = index < currentStreak;
          const isActive = index === currentStreak;

          return (
            <div key={dot} className="flex-1 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="relative"
              >
                {/* Connector Line */}
                {index > 0 && (
                  <div
                    className={`absolute top-1/2 right-full w-full h-0.5 -translate-y-1/2 ${
                      isCompleted ? "bg-[var(--primary-blue)]" : "bg-white/10"
                    }`}
                    style={{ width: "calc(100% + 0.5rem)" }}
                  />
                )}

                {/* Dot */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`
                    relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-gradient-to-br from-[var(--primary-blue)] to-[var(--secondary-blue)] shadow-lg shadow-[var(--primary-blue)]/30"
                        : isActive
                        ? "bg-white/10 border-2 border-dashed border-[var(--primary-blue)]"
                        : "bg-white/5 border border-white/10"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Droplets className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-sm font-medium text-white/30">
                      {dot}
                    </span>
                  )}

                  {/* Pulse animation for active dot */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[var(--primary-blue)]"
                      animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </motion.div>

              {/* Label */}
              <span className="text-xs text-white/30 mt-2">Wash {dot}</span>
            </div>
          );
        })}

        {/* Free Wash Reward */}
        <div className="flex-1 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="relative"
          >
            {/* Connector Line */}
            <div
              className={`absolute top-1/2 right-full w-full h-0.5 -translate-y-1/2 ${
                isFreeWashReady ? "bg-[var(--aqua-cyan)]" : "bg-white/10"
              }`}
              style={{ width: "calc(100% + 0.5rem)" }}
            />

            <motion.div
              whileHover={{ scale: 1.1 }}
              animate={
                isFreeWashReady
                  ? {
                      boxShadow: [
                        "0 0 20px rgba(46, 211, 198, 0.3)",
                        "0 0 40px rgba(46, 211, 198, 0.5)",
                        "0 0 20px rgba(46, 211, 198, 0.3)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
              className={`
                relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                ${
                  isFreeWashReady
                    ? "bg-gradient-to-br from-[var(--aqua-cyan)] to-[var(--primary-blue)]"
                    : "bg-white/5 border border-white/10"
                }
              `}
            >
              <Gift
                className={`w-6 h-6 ${
                  isFreeWashReady ? "text-white" : "text-white/30"
                }`}
              />
            </motion.div>
          </motion.div>

          <span
            className={`text-xs mt-2 font-medium ${
              isFreeWashReady ? "text-[var(--aqua-cyan)]" : "text-white/30"
            }`}
          >
            FREE!
          </span>
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <p className="text-xs text-white/40 text-center">
          Complete 5 consecutive washes to earn a free wash. Streak resets after
          reward is claimed.
        </p>
      </div>
    </Card>
  );
}
