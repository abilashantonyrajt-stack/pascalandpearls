"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const agreed = localStorage.getItem("pnp_cookie_consent");
    if (!agreed) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("pnp_cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto glass-strong p-4 flex items-start sm:items-center gap-4">
        <p className="text-xs text-charcoal/70 leading-relaxed flex-1">
          We use cookies to enhance your experience. By continuing, you agree to our{" "}
          <Link href="/privacy" className="text-mink hover:underline">Privacy Policy</Link>{" "}
          and{" "}
          <Link href="/terms" className="text-mink hover:underline">Terms of Service</Link>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 text-xs tracking-widest uppercase bg-charcoal text-ivory px-5 py-2 hover:bg-charcoal-deep transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
