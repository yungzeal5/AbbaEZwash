"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export default function Typewriter({
  phrases,
  typingSpeed = 80, // Medium-slow for luxury feel
  deletingSpeed = 50, // Slightly faster than typing
  pauseDuration = 1800, // 1.5-2s pause
  className = "",
}: TypewriterProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentPhrase = phrases[currentPhraseIndex];

  const tick = useCallback(() => {
    if (isPaused) return;

    if (isDeleting) {
      // Deleting
      setDisplayText((prev) => prev.slice(0, -1));

      if (displayText === "") {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    } else {
      // Typing
      if (displayText.length < currentPhrase.length) {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      } else {
        // Finished typing, pause then delete
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    }
  }, [
    displayText,
    isDeleting,
    isPaused,
    currentPhrase,
    phrases.length,
    pauseDuration,
  ]);

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(tick, speed);
    return () => clearTimeout(timeout);
  }, [tick, isDeleting, typingSpeed, deletingSpeed]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
        style={{
          display: "inline-block",
          width: "2px",
          height: "1em",
          background: "var(--primary)",
          marginLeft: "4px",
          verticalAlign: "text-bottom",
        }}
      />
    </span>
  );
}
