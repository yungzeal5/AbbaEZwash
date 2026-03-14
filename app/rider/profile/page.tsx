"use client";

import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { ChangeEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Fingerprint,
  Edit3,
  X,
  Check,
  Loader2,
  User as UserIcon,
  Camera,
  Bike,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";

export default function RiderProfilePage() {
  const { user, loading, checkAuth } = useAuth();
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
    if (user) {
      setFormData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        location: { address: user.location?.address || "" },
      });
    }
  }, [user]);

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

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#E5E5E5] border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeProfilePicture = profilePreviewUrl || user.profile_picture;

  return (
    <div className="max-w-4xl !mx-auto space-y-12 !pb-32">
      {/* Header */}
      <section className="flex flex-col items-center text-center gap-6 relative !pt-8">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-0 right-0 !p-3 rounded-2xl bg-white shadow-xl hover:scale-110 transition-all active:scale-95 border border-slate-100"
        >
          <Edit3 className="w-6 h-6 text-primary" />
        </button>

        <div className="relative group">
          <UserAvatar
            user={user}
            src={activeProfilePicture}
            size="xl"
            className="rounded-[40px] shadow-2xl ring-4 ring-white group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute -bottom-2 -right-2 bg-primary !p-2.5 rounded-2xl shadow-lg border-4 border-white">
            <Bike className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="!px-3 !py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/10">
              Official Rider
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Fingerprint className="w-4 h-4" />
              {user.custom_id || "RIDER-" + String(user.id).slice(0, 6)}
            </span>
          </div>
        </div>
      </section>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            icon: Mail,
            label: "Email Address",
            value: user.email,
            color: "bg-blue-50 text-blue-600",
          },
          {
            icon: UserIcon,
            label: "Username",
            value: `@${user.username}`,
            color: "bg-violet-50 text-violet-600",
          },
          {
            icon: Phone,
            label: "Phone Number",
            value: user.phone_number || "Not set",
            color: "bg-green-50 text-green-600",
          },
          {
            icon: MapPin,
            label: "Primary Zone",
            value: user.location?.address || "Zone not assigned",
            color: "bg-amber-50 text-amber-600",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/80 backdrop-blur-sm rounded-3xl !p-6 shadow-sm border border-white flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold !mb-0.5">
                {item.label}
              </p>
              <p className="text-lg font-bold text-slate-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center !p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl !p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between !mb-8">
                <h2 className="text-2xl font-black">Edit Rider Profile</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="!p-2 text-slate-400 hover:text-black"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 !ml-1">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full !px-5 !py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 !ml-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full !px-5 !py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 !ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full !px-5 !py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 !ml-1">
                    Primary Coverage Address
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({ ...formData, location: { address: e.target.value } })
                    }
                    className="w-full !px-5 !py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 !ml-1">Profile Photo</label>
                  <div className="p-4 bg-slate-50 rounded-3xl flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
                      {activeProfilePicture ? (
                        <img src={activeProfilePicture} className="w-full h-full object-cover" />
                      ) : (
                        <Camera />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-white !px-5 !y-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 mt-4 shadow-xl shadow-primary/20"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Check /> Update Profile
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
