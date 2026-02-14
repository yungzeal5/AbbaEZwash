"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Bike,
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
  ];

  return (
    <div className="min-h-screen bg-black text-white !mr-3 !ml-3">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
        <span className="font-bold">Rider Portal</span>
        <button onClick={logout} className="!p-2 text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto !px-4 md:!px-6 lg:!px-8 !py-6 !pb-24 lg:!pb-6">
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
                    className={`flex items-center gap-3 !px-4 !py-3 rounded-xl transition-all ${
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
              className="flex items-center gap-3 w-full !px-4 !py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-600 transition-all border border-transparent hover:border-red-500/20"
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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around !px-2 z-40">
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
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
