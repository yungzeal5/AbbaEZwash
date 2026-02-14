"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bike,
  Star,
  MessageSquare,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/riders", label: "Riders", icon: Bike },
    { href: "/admin/ambassadors", label: "Ambassadors", icon: Users },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/complaints", label: "Complaints", icon: MessageSquare },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="flex-shrink-0 border-r border-white/10 glass-panel z-20 hidden md:block relative transition-all duration-300 ease-in-out"
        style={{
          background: "rgba(10, 10, 10, 0.6)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 mt-10 px-2 overflow-hidden relative min-h-[40px]">
            <Image
              src="/logo/AbbaEzwash.png"
              alt="Abba EZWash Logo"
              width={180}
              height={72}
              className="h-18 w-auto object-contain"
              priority
            />{" "}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                    Abba <span className="text-primary">Admin</span>
                  </span>
                  <span className="text-[10px] text-muted font-mono tracking-widest uppercase">
                    Dashboard
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all border border-white/5 ${
                isSidebarOpen ? "right-0" : "left-[60px]"
              }`}
            >
              {isSidebarOpen ? (
                <ChevronRight className="w-6 h-6 rotate-180" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 !px-3 !py-2.5 rounded-lg transition-all group relative overflow-hidden ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 shrink-0 transition-colors ${
                      isActive ? "text-white" : "group-hover:text-white"
                    }`}
                  />
                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>
          {/* Footer User spacer */}
          <div className="mt-auto !pt-4 border-t border-white/5 opacity-0">
            <div className="h-10"></div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505]">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/AbbaEzwash.png"
              alt="Abba EZWash Logo"
              width={180}
              height={72}
              className="h-18 w-auto object-contain"
              priority
            />{" "}
            <span className="font-bold">Abba Admin</span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar !p-6 md:!p-8 lg:!p-10 !pb-36 md:!pb-10">
          <div className="max-w-7xl !mx-auto !w-full">{children}</div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around !px-2 z-40">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 !p-2 transition-all ${
                  isActive ? "text-primary scale-110" : "text-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
