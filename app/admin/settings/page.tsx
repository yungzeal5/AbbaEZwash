"use client";

import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Shield,
  Cpu,
  Save,
  RefreshCcw,
  Cloud,
  Database,
  Lock,
  Globe,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const { logout } = useAuth();

  const tabs = [
    { id: "General", icon: Globe },
    { id: "Security", icon: Shield },
    { id: "Notifications", icon: Bell },
    { id: "System", icon: Cpu },
    { id: "Account", icon: LogOut },
  ];

  return (
    <div className="space-y-8 !pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white !mb-1">Settings</h1>
          <p className="text-muted text-lg">
            Configure your platform and manage system parameters.
          </p>
        </div>
        <button className="btn btn-primary shadow-lg shadow-primary/20 gap-2">
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save Changes</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar border-b lg:border-b-0 lg:border-r border-white/5 !pb-2 lg:!pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 !px-4 !py-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white shadow-xl"
                    : "text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.id}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 max-w-3xl space-y-8">
          {activeTab === "General" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  General Configuration
                </h3>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Abba EZWash"
                      className="w-full !px-4 !py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">
                      Support Email
                    </label>
                    <input
                      type="email"
                      defaultValue="support@abba-ezwash.com"
                      className="w-full !px-4 !py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest ">
                      Currency Code
                    </label>
                    <select className="w-full !px-4 !py-3 !mb-6 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary transition-all appearance-none">
                      <option>GHS</option>
                      <option>USD</option>
                      <option>GBP</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="card glass-panel !p-6 border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">Maintenance Mode</h4>
                    <p className="text-xs text-muted italic">
                      Only admins can access the platform during maintenance.
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "System" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card glass-panel !p-5 border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="!p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">Database Clusters</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">MongoDB Atlas</span>
                    <span className="text-[10px] font-bold !px-2 !py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-tight">
                      Healthy
                    </span>
                  </div>
                </div>

                <div className="card glass-panel !p-5 border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="!p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">API Infrastructure</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">Response Time</span>
                    <span className="text-xs font-mono font-bold text-white">42ms</span>
                  </div>
                </div>
              </div>

              <section className="space-y-4 !pt-4 border-t border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <RefreshCcw className="w-4 h-4 text-primary" />
                  Platform Cache
                </h3>
                <p className="text-sm text-muted">
                  Clearing the cache will force the platform to re-fetch all dynamic data.
                </p>
                <button className="btn btn-secondary border-dashed border-2 hover:border-red-500/50 hover:text-red-400 transition-all font-mono text-xs">
                  Flush Platform Redis Cache
                </button>
              </section>
            </motion.div>
          )}

          {activeTab === "Account" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <LogOut className="w-8 h-4 text-red-500" />
                  Account & Security
                </h3>
                <p className="text-sm text-muted">
                  Managed your active session and platform access.
                </p>

                <div className="card glass-panel !p-8 border-red-500/10 bg-red-500/5 !mt-8 items-center flex flex-col text-center">
                  <div className="!p-4 rounded-full bg-red-500/10 text-red-500 !mb-4">
                    <LogOut className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white !mb-2">End Session</h4>
                  <p className="text-sm text-muted !mb-8 max-w-sm">
                    Are you sure you want to log out? You will need to re-authenticate to access the
                    admin dashboard.
                  </p>
                  <button
                    onClick={logout}
                    className="btn bg-red-500 hover:bg-red-600 text-white w-full max-w-xs shadow-lg shadow-red-500/20"
                  >
                    Logout Now
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
