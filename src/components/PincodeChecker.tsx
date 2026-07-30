"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "available" | "unavailable">("idle");

  async function handleCheck() {
    if (pincode.length !== 6) return;
    setStatus("loading");
    try {
      const snap = await getDoc(doc(db, "pincodes", pincode));
      if (snap.exists() && snap.data().serviceable === true) {
        setStatus("available");
      } else {
        setStatus("unavailable");
      }
    } catch {
      setStatus("unavailable");
    }
  }

  return (
    <div className="glass-strong p-4">
      <p className="text-xs tracking-widest uppercase text-charcoal mb-3">Check Delivery Availability</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter PIN code"
          className="flex-1 glass-input px-3 py-2 text-sm text-charcoal focus:outline-none"
          maxLength={6}
        />
        <button
          onClick={handleCheck}
          disabled={pincode.length !== 6 || status === "loading"}
          className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors disabled:opacity-40"
        >
          {status === "loading" ? "..." : "Check"}
        </button>
      </div>
      {status === "available" && (
        <p className="mt-2 text-xs text-green-600">Available in your area!</p>
      )}
      {status === "unavailable" && (
        <p className="mt-2 text-xs text-red-500">Sorry, we don't deliver here yet.</p>
      )}
    </div>
  );
}
