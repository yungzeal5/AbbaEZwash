"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: "default" | "glass" | "outlined";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-[var(--card-bg)] border border-white/5",
  glass: "glass-card",
  outlined: "bg-transparent border border-white/10",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  variant = "default",
  hover = false,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? "hover-lift cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
