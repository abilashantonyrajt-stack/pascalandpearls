"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/LanguageProvider";
import { LoaderCircle, Bell } from "lucide-react";

export default function BackInStockButton({ productId }: { productId: string }) {
  const { t } = useI18n();
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [stock, setStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "products", productId), (snap) => {
      if (snap.exists()) setStock(snap.data().stock ?? 0);
    });
    return unsub;
  }, [productId]);

  if (stock === null || stock > 0) return null;

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }
    const confirmed = window.confirm(t("backInStock.label"));
    if (!confirmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email: user!.email }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      alert(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <p className="text-xs text-green-600 mt-2">{t("backInStock.success")}</p>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="glass text-xs tracking-widest uppercase text-charcoal px-5 py-2.5 mt-2 flex items-center gap-2 hover:bg-white/20 transition-all disabled:opacity-50"
    >
      {loading ? <LoaderCircle size={14} className="animate-spin" /> : <Bell size={14} />}
      {t("backInStock.title")}
    </button>
  );
}
