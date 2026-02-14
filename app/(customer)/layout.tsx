"use client";

import "../styles/customer.css";
import AppShell from "@/components/layout/AppShell";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
