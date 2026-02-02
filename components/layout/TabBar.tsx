"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Flashlight, Clock, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/spotlight", label: "Spotlight", icon: Flashlight },
  { href: "/history", label: "History", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <motion.nav
      className="tabbar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tabbar-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`tab-item ${isActive ? "active" : ""}`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
