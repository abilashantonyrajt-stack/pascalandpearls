"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Check, LoaderCircle } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await addDoc(collection(db, "subscribers"), {
        email: email.trim(),
        createdAt: Timestamp.now(),
      });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-xs tracking-widest uppercase text-ivory/80">Newsletter</h4>
      <p className="text-sm text-ivory/50">Be the first to know about new collections and exclusive offers.</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-white/10 text-sm text-ivory px-3 py-2 placeholder:text-ivory/30 focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "done"}
          className="text-xs tracking-widest uppercase bg-gold text-charcoal px-4 py-2 hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {status === "loading" ? <LoaderCircle size={14} className="animate-spin" /> : status === "done" ? <Check size={14} /> : "Join"}
        </button>
      </div>
      {status === "done" && <p className="text-xs text-green-400">You&apos;re subscribed!</p>}
      {status === "error" && <p className="text-xs text-red-400">Something went wrong.</p>}
    </form>
  );
}
