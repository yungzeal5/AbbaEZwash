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
import UserAvatar from "@/components/ui/UserAvatar";

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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/catalog", label: "Catalog", icon: Star }, // Reusing Star or adding Archive
    { href: "/admin/riders", label: "Riders", icon: Bike },
    { href: "/admin/ambassadors", label: "Ambassadors", icon: Users },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/complaints", label: "Complaints", icon: MessageSquare },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur-xl z-20 hidden md:block relative transition-all duration-300 ease-in-out"
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8 mt-6 px-2 overflow-hidden relative min-h-[40px]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo/AbbaEzwash.png"
                  alt="Abba EZWash Logo"
                  width={140}
                  height={56}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-primary transition-all border border-slate-200 ${
                  !isSidebarOpen ? "hidden" : ""
                }`}
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm"
                >
                  <UserAvatar user={user} size="md" className="ring-2 ring-white shadow-sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {user.first_name || user.username}
                    </span>
                    <span className="text-[10px] text-primary font-black tracking-widest uppercase">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-primary transition-all border border-slate-200"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <UserAvatar user={user} size="sm" className="ring-2 ring-white shadow-sm" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Nav */}
          <nav className="flex-1 space-y-1 mt-6!">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 !px-4 !py-3 rounded-2xl transition-all group relative overflow-hidden ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 shrink-0 transition-colors ${
                      isActive ? "text-white" : "group-hover:text-primary"
                    }`}
                  />
                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-bold text-sm whitespace-nowrap overflow-hidden tracking-tight"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-2!">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full !px-4 !py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
            >
              <LogOut className="w-6 h-6" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Image
              src="/logo/AbbaEzwash.png"
              alt="Abba EZWash Logo"
              width={140}
              height={56}
              className="h-10 w-auto object-contain"
              priority
            />{" "}
            <span className="font-black text-sm text-slate-900">ADMIN</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-400">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar !p-6 md:!p-10 !pb-36 md:!pb-12 text-slate-900">
          <div className="max-w-7xl !mx-auto !w-full">{children}</div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around !px-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          {links.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1.5 !px-3 !py-2 transition-all rounded-xl ${
                  isActive ? "text-primary bg-primary/5 font-black" : "text-slate-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-[9px] uppercase tracking-wider">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
