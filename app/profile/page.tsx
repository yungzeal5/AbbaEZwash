"use client";

import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  LogOut,
  Shield,
  Fingerprint,
  Trash2,
  Settings,
  Bell,
  CreditCard,
  Edit3,
  X,
  Check,
  Loader2,
  User as UserIcon,
  MessageCircle,
  Headphones,
  Camera,
} from "lucide-react";
import StreakTracker from "@/components/profile/StreakTracker";
import UserAvatar from "@/components/ui/UserAvatar";

export default function ProfilePage() {
  const { user, loading, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    location: { address: "" },
  });
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (user) {
      setFormData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        location: { address: user.location?.address || "" },
      });
      setSelectedProfileImage(null);
      setProfilePreviewUrl(null);
    }
  }, [user, loading, router]);

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
    };
  }, [profilePreviewUrl]);

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl);
    }

    setSelectedProfileImage(file);
    setProfilePreviewUrl(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("username", formData.username.trim());
      payload.append("first_name", formData.first_name.trim());
      payload.append("last_name", formData.last_name.trim());
      payload.append("email", formData.email.trim());
      payload.append("phone_number", formData.phone_number.trim());
      payload.append("location", JSON.stringify(formData.location));
      if (selectedProfileImage) {
        payload.append("profile_picture", selectedProfileImage);
      }

      await apiRequest("/users/profile/", {
        method: "PATCH",
        body: payload,
      });
      await checkAuth(); // Refresh user data
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete your account? This action cannot be reversed.",
      )
    )
      return;
    try {
      await apiRequest("/users/profile/", {
        method: "DELETE",
      });
      logout();
      router.push("/");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete account";
      alert(errorMessage);
    }
  };

  if (loading || !user) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="text-center">
          <p className="text-body text-primary font-medium">Loading your luxury profile...</p>
        </div>
      </div>
    );
  }

  const activeProfilePicture = profilePreviewUrl || user.profile_picture;

  return (
    <div className="page-content" style={{ paddingBottom: "120px" }}>
      {/* Header */}
      <section style={{ padding: "40px 0 32px" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 relative"
          >
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-0 right-0 !p-3 rounded-2xl bg-white shadow-lg border border-slate-100 text-primary hover:scale-110 transition-transform active:scale-95"
            >
              <Edit3 className="w-5 h-5" />
            </button>

            <div className="relative">
              <UserAvatar
                user={user}
                src={activeProfilePicture}
                size="xl"
                className="rounded-[32px] shadow-xl shadow-primary/20"
              />
              <div
                className="absolute shadow-lg border-2 border-white"
                style={{
                  bottom: -4,
                  right: -4,
                  padding: "6px",
                  background: "var(--gold)",
                  borderRadius: "14px",
                }}
              >
                <Shield className="w-4 h-4 text-white fill-white" />
              </div>
            </div>

            <div className="!mt-2">
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
              </h1>
              <div className="flex items-center justify-center gap-2 !mt-2">
                <span className="!!px-3 !!py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/10">
                  {user.role}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Fingerprint className="w-3.5 h-3.5" />
                  {user.custom_id || String(user.id).slice(0, 8)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Streak Tracker (Only for Customers) */}
          {user.role === "CUSTOMER" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="!mt-8"
            >
              <StreakTracker count={user.streak_count || 0} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Info */}
      <section className="!mb-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card overflow-hidden"
            style={{ padding: 0, background: "white" }}
          >
            <div className="list-item border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center !mr-4">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold !mb-0.5">
                  Email Address
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
              </div>
            </div>

            <div className="list-item border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center !mr-4">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold !mb-0.5">
                  Username
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">@{user.username}</p>
              </div>
            </div>

            <div className="list-item border-b border-slate-50">
              <div className="w-10 h-10 rounded-xl bg-secondary/5 text-secondary flex items-center justify-center !mr-4">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold !mb-0.5">
                  Phone Number
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {user.phone_number || "Not verified"}
                </p>
              </div>
            </div>

            <div className="list-item">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center !mr-4">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold !mb-0.5">
                  Primary Location
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {user.location?.address || "Set your address"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Account Settings */}
      <section className="!mb-8">
        <div className="container">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black !mb-4 !pl-1">
            Configuration
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card overflow-hidden"
            style={{ padding: 0, background: "white" }}
          >
            {[
              {
                icon: MessageCircle,
                label: "Submit a Complaint",
                color: "text-blue-500",
                onClick: () => router.push("/profile/complaints"),
              },
              { icon: Settings, label: "Security & Privacy", color: "text-slate-400" },
              { icon: Bell, label: "Notification Preferences", color: "text-slate-400" },
              { icon: CreditCard, label: "Payment Methods", color: "text-slate-400" },
            ].map((item, i, arr) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`list-item list-item-interactive w-full justify-between !!py-4 ${i < arr.length - 1 ? "border-b border-slate-50" : ""}`}
              >
                <div className="flex items-center">
                  <item.icon className={`w-5 h-5 mr-4 ${item.color}`} />
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Helpline & Legal */}
      <section className="mb-8!">
        <div className="container">
          <div className="bg-slate-900 rounded-[32px] !p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-40 h-40 bg-primary/20 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 !mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Headphones className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Support Helpline</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Available 24/7 for you</p>
                </div>
              </div>
              <a
                href="tel:0543955261"
                className="text-3xl font-black tracking-tight text-white hover:text-primary transition-colors flex items-center gap-2"
              >
                0543955261
              </a>
              <p className="!mt-4 text-xs text-slate-400 font-medium leading-relaxed max-w-[240px]">
                Need help with something concerning your laundry? Call our concierge line.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <div className="container">
          <div className="flex flex-col gap-3">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={logout}
              className="btn w-full flex items-center justify-center gap-2 !py-4! rounded-2xl font-black text-sm transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border-none"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Session
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleDeleteAccount}
              className="btn w-full items-center justify-center gap-2 !py-4! rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:text-red-600 bg-red-50/50 hover:bg-red-50 border-none inline-flex"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Deactivate Account
            </motion.button>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center !p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl !p-8 !mb-auto !mt-10"
            >
              <div className="absolute top-0 right-0 !p-8">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="!p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4 !mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Edit Profile</h3>
                  <p className="text-slate-500 font-medium">Keep your account details up to date</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                    Location Address
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({ ...formData, location: { address: e.target.value } })
                    }
                    className="w-full !px-5 !py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                    placeholder="e.g. 123 Luxury Lane, Accra"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 !ml-1">
                    Profile Picture (From Device)
                  </label>
                  <div className="!p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary">
                        {activeProfilePicture ? (
                          <img
                            src={activeProfilePicture}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="block w-full text-sm text-slate-700 file:!mr-4 file:!px-4 file:!py-2 file:rounded-xl file:border-none file:bg-primary file:text-white file:font-bold file:cursor-pointer"
                        />
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 !mt-2">
                          JPG, PNG, or WEBP
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 !pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 !px-6 !py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-[2] btn btn-primary flex items-center justify-center gap-2 py-4! rounded-2xl shadow-xl shadow-primary/20 font-black transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
