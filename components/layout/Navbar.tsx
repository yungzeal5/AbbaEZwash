"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/spotlight", label: "Spotlight" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    if (!isHomePage) return;

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <motion.header
      className={`navbar ${isHomePage && !isScrolled ? "navbar-transparent" : ""}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container navbar-inner">
        {/* Logo */}
        <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/AbbaEzwash.png"
              alt="Abba EZWash Logo"
              width={180}
              height={72}
              className="h-18 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links hidden lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
            <Link
              href="/admin"
              className={`nav-link ${pathname.startsWith("/admin") ? "active" : ""}`}
              style={{ color: "var(--accent)" }}
            >
              Admin
            </Link>
          )}
          {user?.role === "AMBASSADOR" && (
            <Link
              href="/ambassador"
              className={`nav-link ${pathname.startsWith("/ambassador") ? "active" : ""}`}
              style={{ color: "var(--accent)" }}
            >
              Dashboard
            </Link>
          )}
          {user?.role === "RIDER" && (
            <Link
              href="/rider"
              className={`nav-link ${pathname.startsWith("/rider") ? "active" : ""}`}
              style={{ color: "var(--accent)" }}
            >
              Portal
            </Link>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="avatar avatar-sm flex items-center justify-center bg-primary text-white font-medium"
              >
                {getInitials(user.username)}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
