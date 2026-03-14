"use client";

import { User } from "@/context/AuthContext";
import { BACKEND_URL } from "@/lib/api";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  user?: User | null;
  src?: string | null;
  username?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[8px]",
  sm: "w-8 h-8 text-[10px]",
  md: "w-10 h-10 text-xs",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

export default function UserAvatar({
  user,
  src,
  username,
  size = "md",
  className = "",
  fallbackClassName = "",
}: UserAvatarProps) {
  let avatarSrc = src || user?.profile_picture;

  if (avatarSrc && avatarSrc.startsWith("/media/")) {
    avatarSrc = `${BACKEND_URL}${avatarSrc}`;
  }

  const avatarUsername = username || user?.username || "User";

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const baseClasses =
    "relative flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300";
  const finalSizeClass = sizeClasses[size];

  if (avatarSrc) {
    return (
      <div className={`${baseClasses} ${finalSizeClass} rounded-full bg-slate-100 ${className}`}>
        <img
          src={avatarSrc}
          alt={avatarUsername}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Handle broken image
            (e.target as HTMLImageElement).style.display = "none";
            // Show fallback initials instead
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              parent.innerHTML = `<span class="font-bold text-white uppercase">${getInitials(avatarUsername)}</span>`;
              parent.className += " bg-primary";
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${finalSizeClass} rounded-full bg-primary text-white font-bold uppercase ${fallbackClassName} ${className}`}
    >
      {getInitials(avatarUsername)}
    </div>
  );
}
