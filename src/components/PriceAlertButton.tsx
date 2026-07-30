"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, LoaderCircle, Check } from "lucide-react";

export default function PriceAlertButton({
  productId,
  currentPrice,
}: {
  productId: string;
  currentPrice: number;
}) {
  const { user, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [desiredPrice, setDesiredPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !desiredPrice) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/price-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId, desiredPrice: Number(desiredPrice) }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setDone(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 text-xs text-green-600 mt-2">
        <Check size={14} /> We'll notify you if the price drops!
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="glass text-xs tracking-widest uppercase text-charcoal px-5 py-2.5 mt-2 flex items-center gap-2 hover:bg-white/20 transition-all"
      >
        <Bell size={14} /> Notify Me if Price Drops
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="glass-strong p-4 mt-2 space-y-3">
          <div>
            <label className="text-[10px] tracking-widest uppercase text-mink mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs text-charcoal focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-mink mb-1 block">Desired Price (₹)</label>
            <input
              type="number"
              value={desiredPrice}
              onChange={(e) => setDesiredPrice(e.target.value)}
              min="1"
              max={currentPrice}
              className="w-full glass-input px-3 py-2 text-xs text-charcoal focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-xs tracking-widest uppercase bg-charcoal text-ivory py-2 hover:bg-charcoal-deep transition-colors disabled:opacity-50"
          >
            {loading ? <LoaderCircle size={14} className="animate-spin mx-auto" /> : "Set Alert"}
          </button>
        </form>
      )}
    </div>
  );
}
