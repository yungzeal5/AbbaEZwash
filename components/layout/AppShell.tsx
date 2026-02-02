"use client";

import { ReactNode } from "react";
import Navbar from "./Navbar";
import TabBar from "./TabBar";
import { usePathname } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isExcludedRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/rider");

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop Navigation */}
      {!isExcludedRoute && <Navbar />}

      {/* Main Content */}
      <main className="page-wrapper">{children}</main>

      {/* Mobile Navigation */}
      {!isExcludedRoute && <TabBar />}
    </div>
  );
}
