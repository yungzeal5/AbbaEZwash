"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bike,
  History,
  User as UserIcon,
  LogOut,
} from "lucide-react";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (
        user.role !== "RIDER" &&
        user.role !== "ADMIN" &&
        user.role !== "SUPER_ADMIN"
      ) {
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
    { href: "/rider", label: "Dashboard", icon: LayoutDashboard },
    { href: "/rider/tasks", label: "Available Tasks", icon: Bike },
    { href: "/rider/history", label: "Task History", icon: History },
    { href: "/rider/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-white lg:pt-(--nav-height)">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <span className="font-bold">Rider Portal</span>
        <button onClick={logout} className="p-2 text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar - Large Screens */}
          <aside className="hidden lg:block space-y-6">
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-var(--nav-height)-48px)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
