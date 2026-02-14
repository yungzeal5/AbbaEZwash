"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Award,
  Shield,
  User as UserIcon,
  Loader2,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  streak_count: number;
  created_at: string;
  custom_id: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRole, setActiveRole] = useState("All");
  const { user: currentUser } = useAuth();

  // Registration states
  const [showRegModal, setShowRegModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    role: "CUSTOMER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // For now we'll fetch all users, we might need a dedicated admin/users endpoint if not existing
      const data = await apiRequest("/users/superadmin/users/");
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const handleDeleteUser = async (id: number) => {
    if (deletingId) return;
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    )
      return;

    setDeletingId(id);
    try {
      await apiRequest(`/users/superadmin/users/${id}/`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 404) {
        alert("This user no longer exists. Refreshing the list.");
        fetchUsers();
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete user";
        alert(errorMessage);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("/users/superadmin/create-staff/", {
        method: "POST",
        body: JSON.stringify(newUserData),
      });
      setShowRegModal(false);
      setNewUserData({
        username: "",
        email: "",
        password: "",
        phone_number: "",
        role: "CUSTOMER",
      });
      fetchUsers();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to register user";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.custom_id.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeRole === "All") return matchesSearch;
    return matchesSearch && user.role === activeRole.toUpperCase();
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "RIDER":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "CUSTOMER":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-muted bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-8 !pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white !mb-1 tracking-tight">
            Users
          </h1>
          <p className="text-muted text-sm">
            Manage and monitor all platform members.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full !pl-10 !pr-4 !py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            onClick={() => setShowRegModal(true)}
            className="btn btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Register User
          </button>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar !pb-1 sm:!pb-0 !mb-3">
            {["All", "Customer", "Rider", "Admin"].map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`!px-4 !py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  activeRole === role
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white/5 border-white/10 text-muted hover:bg-white/10"
                }`}
              >
                {role}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center !py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted font-medium">Loading user directory...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block card glass-panel overflow-hidden border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                    User
                  </th>
                  <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                    Role
                  </th>
                  <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                    Contact
                  </th>
                  <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none text-center">
                    Streak
                  </th>
                  <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none">
                    Joined
                  </th>
                  <th className="!p-5 text-[11px] font-bold text-muted uppercase tracking-widest leading-none text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="!p-20 text-center text-muted italic"
                    >
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="!p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-white">
                              {user.username}
                            </span>
                            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                              {user.custom_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="!p-5">
                        <span
                          className={`inline-flex items-center !px-2.5 !py-1 rounded-md text-[10px] font-bold tracking-wide uppercase border ${getRoleColor(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="!p-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-secondary">
                            <Mail className="w-3 h-3 text-muted" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-2 text-xs text-secondary">
                              <Phone className="w-3 h-3 text-muted" />
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="!p-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center gap-1.5 text-primary">
                            <Award className="w-4 h-4" />
                            <span className="font-bold text-lg">
                              {user.streak_count}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="!p-5 text-sm text-muted">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted/50" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="!p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="!p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-all border border-white/5"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>

                          {currentUser?.role === "SUPER_ADMIN" && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingId === user.id}
                              className="!p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all border border-red-500/10 disabled:opacity-50"
                              title="Delete User"
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center !py-20 card glass-panel border-dashed border-2 border-white/5">
                <p className="text-muted">No users found.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="card glass-panel !p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-lg text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-white">
                          {user.username}
                        </h3>
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                          {user.custom_id}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center !px-2 !py-0.5 rounded text-[9px] font-bold uppercase border ${getRoleColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-2 !py-2">
                    <div className="flex items-center gap-3 text-sm text-secondary">
                      <Mail className="w-4 h-4 text-muted shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone_number && (
                      <div className="flex items-center gap-3 text-sm text-secondary">
                        <Phone className="w-4 h-4 text-muted shrink-0" />
                        <span>{user.phone_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between !pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-white">
                        {user.streak_count} Streak
                      </span>
                    </div>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="btn btn-xs btn-secondary"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center !p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-lg !p-8 glass-panel border-white/10"
          >
            <h2 className="text-2xl font-bold text-white !mb-6">
              Register New User
            </h2>

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted uppercase font-bold !px-1">
                    Username
                  </label>
                  <input
                    required
                    type="text"
                    value={newUserData.username}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        username: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl !px-4 !py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted uppercase font-bold !px-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, email: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl !px-4 !py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted uppercase font-bold !px-1">
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, password: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl !px-4 !py-2.5 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted uppercase font-bold !px-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newUserData.phone_number}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl !px-4 !py-2.5 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted uppercase font-bold !px-1">
                  Role
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl !px-4 !py-2.5 text-sm text-white"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="RIDER">Rider</option>
                  <option value="AMBASSADOR">Ambassador</option>
                  {currentUser?.role === "SUPER_ADMIN" && (
                    <option value="ADMIN">Admin</option>
                  )}
                  {currentUser?.role === "SUPER_ADMIN" && (
                    <option value="SUPER_ADMIN">Super Admin</option>
                  )}
                </select>
              </div>

              <div className="flex gap-4 !pt-6">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
