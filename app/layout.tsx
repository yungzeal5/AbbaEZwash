import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Abba EZWash | Luxury Laundry Service",
  description:
    "Premium laundry service that makes your life easier. Experience the luxury of professional garment care.",
  keywords: [
    "laundry",
    "dry cleaning",
    "luxury",
    "garment care",
    "wash",
    "fold",
  ],
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
