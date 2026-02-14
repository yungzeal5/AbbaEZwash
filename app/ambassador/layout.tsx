"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Award,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AmbassadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "AMBASSADOR") {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  const navItems = [
    { name: "Dashboard", path: "/ambassador", icon: <Home size={24} /> },
    {
      name: "My Referrals",
      path: "/ambassador/customers",
      icon: <Users size={24} />,
    },
    {
      name: "Earnings",
      path: "/ambassador/earnings",
      icon: <Award size={24} />,
    },
  ];

  if (loading || !user || user.role !== "AMBASSADOR") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#0071E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#0071E3] selection:text-white">
      {/* Removed Top Header for cleaner floating nav only look */}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-32">{children}</main>

      {/* Premium Bottom Navigation Tab Bar (Apple Mobile Style) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1D1D1F]/90 backdrop-blur-2xl !px-10 !py-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-12 w-fit max-w-[90vw] transition-all duration-500 hover:bg-[#1D1D1F] hover:scale-105">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive
                  ? "text-[#0071E3] scale-110"
                  : "text-[#D2D2D7] hover:text-white"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-bold tracking-tight uppercase opacity-70">
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 bg-[#0071E3] rounded-full shadow-[0_0_8px_#0071E3]"></span>
              )}
            </Link>
          );
        })}

        <div className="h-8 w-px bg-white/10 ml-2 mr-2"></div>

        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 text-[#FF453A] hover:text-[#FF3B30] transition-all hover:scale-110"
        >
          <span className="text-2xl">
            <LogOut />
          </span>
          <span className="text-[10px] font-bold tracking-tight uppercase opacity-70">
            Logout
          </span>
        </button>
      </nav>

      {/* Ambassador-specific styles moved to globals.css */}
    </div>
  );
}
