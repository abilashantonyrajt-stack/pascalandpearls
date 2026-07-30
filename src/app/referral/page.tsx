"use client";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/LanguageProvider";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Gift, Copy, Check } from "lucide-react";

function generateCode(email: string): string {
  const prefix = email.split("@")[0];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let rand = "";
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${rand}`;
}

export default function ReferralPage() {
  const { user, isLoggedIn } = useAuth();
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [earned, setEarned] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const stored = localStorage.getItem("pnp_referral_code");
    if (stored) {
      setCode(stored);
    } else {
      const c = generateCode(user.email);
      setCode(c);
      localStorage.setItem("pnp_referral_code", c);
    }
    setEarned(Number(localStorage.getItem("pnp_referral_earned")) || 0);
  }, [isLoggedIn, user]);

  const copyLink = useCallback(() => {
    const link = `https://pascal-and-pearls.vercel.app/?ref=${code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-xl p-8 text-center max-w-sm w-full">
          <Gift size={40} className="mx-auto mb-4 text-gold" />
          <p className="text-sm text-charcoal/70 mb-4">{t("auth.title")}</p>
          <Link
            href="/auth"
            className="inline-block text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors"
          >
            {t("nav.signIn")}
          </Link>
        </div>
      </div>
    );
  }

  const referralLink = `https://pascal-and-pearls.vercel.app/?ref=${code}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-xl p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <Gift size={40} className="mx-auto mb-3 text-gold" />
          <h1 className="text-lg text-charcoal font-medium">{t("referral.title")}</h1>
        </div>

        <p className="text-xs text-charcoal/70 leading-relaxed text-center">
          {t("referral.description")}
        </p>

        <div className="space-y-2">
          <label className="text-[11px] tracking-widest uppercase text-mink">
            {t("referral.code")}
          </label>
          <div className="glass-input rounded-lg px-4 py-3 text-sm text-charcoal font-mono text-center tracking-wider">
            {code}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] tracking-widest uppercase text-mink">
            {t("referral.link")}
          </label>
          <div className="glass-input rounded-lg px-4 py-3 text-xs text-charcoal/70 break-all">
            {referralLink}
          </div>
        </div>

        <button
          onClick={copyLink}
          className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t("referral.copied") : t("referral.copy")}
        </button>

        <div className="glass rounded-lg p-4 text-center">
          <p className="text-[11px] tracking-widest uppercase text-mink mb-1">
            {t("referral.earned")}
          </p>
          <p className="text-xl text-charcoal font-medium">
            ₹{earned.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
