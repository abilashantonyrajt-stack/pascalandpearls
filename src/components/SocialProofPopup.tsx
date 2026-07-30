"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

const NOTIFICATIONS = [
  { name: "Priya S.", product: "Pearl Drop Earrings" },
  { name: "Ananya K.", product: "Gold Beaded Bracelet" },
  { name: "Riya M.", product: "Pearl Stud Earrings" },
  { name: "Neha R.", product: "Crystal Pendant Set" },
  { name: "Divya P.", product: "Rose Quartz Necklace" },
  { name: "Sneha T.", product: "Emerald Drop Earrings" },
  { name: "Kavita G.", product: "Pearl Choker" },
  { name: "Meera J.", product: "Silver Anklet" },
  { name: "Aisha L.", product: "Opal Ring" },
  { name: "Pooja W.", product: "Amethyst Bracelet" },
];

export default function SocialProofPopup() {
  const { t } = useI18n();
  const [current, setCurrent] = useState<{ name: string; product: string } | null>(null);
  const [visible, setVisible] = useState(false);

  const show = useCallback(() => {
    const n = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    setCurrent(n);
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    const schedule = () => {
      const delay = 15000 + Math.random() * 15000;
      return setTimeout(() => {
        show();
        schedule();
      }, delay);
    };
    const timer = schedule();
    return () => clearTimeout(timer);
  }, [show]);

  if (!current || !visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className="glass-card px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg max-w-xs">
        <Sparkles size={16} className="text-gold shrink-0" />
        <p className="text-xs text-charcoal/80 leading-relaxed">
          {t("socialProof.justBought", { name: current.name, product: current.product })}
        </p>
      </div>
    </div>
  );
}
