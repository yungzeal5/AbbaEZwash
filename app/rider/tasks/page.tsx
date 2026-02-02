"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Package, Clock, Filter } from "lucide-react";

export default function RiderTasks() {
  const tasks = [
    {
      id: "EZ-1003",
      pickup: "Labone",
      delivery: "Airport Residential",
      distance: "4.2km",
      price: "45",
      type: "Delivery",
    },
    {
      id: "EZ-1004",
      pickup: "East Legon",
      delivery: "Cantonments",
      distance: "3.8km",
      price: "40",
      type: "Pickup",
    },
    {
      id: "EZ-1005",
      pickup: "Spintex",
      delivery: "Osu",
      distance: "8.5km",
      price: "65",
      type: "Delivery",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Available Tasks</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary outline-none text-sm w-full md:w-64"
            />
          </div>
          <button className="btn btn-secondary btn-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-5 border-white/5 bg-white/2 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{task.id}</span>
                  <span className="badge badge-accent py-0.5">{task.type}</span>
                </div>
                <div className="flex flex-col text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {task.pickup} → {task.delivery}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{task.distance} • ~25 mins</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
              <div className="text-right">
                <div className="text-sm text-muted">Estimated Pay</div>
                <div className="text-xl font-bold text-green-400">
                  GHS {task.price}
                </div>
              </div>
              <button className="btn btn-primary btn-sm px-6">Accept</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
