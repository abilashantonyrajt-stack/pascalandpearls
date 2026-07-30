"use client";

import { Check, Clock, Package, Truck, X } from "lucide-react";
import type { StatusEvent } from "@/lib/orders";

const statusIcons: Record<string, any> = {
  pending: Clock,
  shipped: Truck,
  delivered: Check,
  cancelled: X,
  "payment:completed": Check,
  "payment:failed": X,
};

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  shipped: "text-blue-600 bg-blue-50 border-blue-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
  "payment:completed": "text-green-600 bg-green-50 border-green-200",
  "payment:failed": "text-red-600 bg-red-50 border-red-200",
};

export default function OrderTimeline({ history }: { history?: StatusEvent[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs tracking-widest uppercase text-mink mb-3">Order Timeline</p>
      {history.map((event, i) => {
        const Icon = statusIcons[event.status] || Package;
        const colors = statusColors[event.status] || "text-mink bg-ivory border-stone";
        const isLast = i === history.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${colors}`}>
                <Icon size={14} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-stone/50 mt-1" />}
            </div>
            <div className="pb-4">
              <p className="text-sm text-charcoal">{event.note || event.status}</p>
              <p className="text-[10px] text-mink mt-0.5">
                {new Date(event.timestamp).toLocaleString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
