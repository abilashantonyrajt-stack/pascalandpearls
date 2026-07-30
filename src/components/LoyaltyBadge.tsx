"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Gift } from "lucide-react";

export default function LoyaltyBadge() {
  const { user } = useAuth();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/loyalty?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => setPoints(data.points ?? 0))
      .catch(() => {});
  }, [user?.email]);

  if (points === null) return null;

  return (
    <Link
      href="/bundles"
      className="flex items-center gap-1 text-mink/60 hover:text-charcoal transition-colors"
      title="Loyalty Points"
    >
      <Gift size={12} />
      <span className="text-xs">{points} pts</span>
    </Link>
  );
}
