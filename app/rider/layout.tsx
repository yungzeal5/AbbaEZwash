"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Bike, LogOut, History, User as UserIcon } from "lucide-react";

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "RIDER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
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
    { href: "/rider", label: "Dashboard", icon: LayoutDashboard },
    { href: "/rider/tasks", label: "Tasks", icon: Bike },
    { href: "/rider/history", label: "History", icon: History },
    { href: "/rider/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 !mr-3 !ml-3">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
          <span className="font-black text-sm uppercase tracking-wider">Rider Portal</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto !px-4 md:!px-6 lg:!px-8 !py-8 !pb-24 lg:!pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar - Large Screens */}
          <aside className="hidden lg:block space-y-6">
            <div className="card bg-white/50 backdrop-blur-sm p-4!">
              <nav className="space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 !px-4 !py-3 rounded-2xl transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5 font-bold" />
                      <span className="font-bold tracking-tight">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={logout}
                className="flex items-center gap-3 w-full mt-4! !px-4 !py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-var(--nav-height)-48px)]">{children}</main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around !px-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1.5 !px-5 !py-2 transition-all rounded-xl ${
                isActive ? "text-primary bg-primary/5 font-black" : "text-slate-400"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[10px] uppercase tracking-wider font-bold">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
