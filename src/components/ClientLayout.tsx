"use client";

import { useState, useEffect, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSiteContent } from "@/context/SiteContentContext";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const content = useSiteContent();
  const announcement = content.announcement_bar;
  const showAnnouncement = announcement?.active && announcement?.text;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pnp_user");
      if (raw) {
        const user = JSON.parse(raw);
        const email = user?.email;
        if (email) {
          const reminded = sessionStorage.getItem("pnp_abandoned_checked");
          if (!reminded) {
            sessionStorage.setItem("pnp_abandoned_checked", "1");
            fetch("/api/abandoned-cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }).catch(() => {});
          }
        }
      }
    } catch {}
  }, []);

  return (
    <>
      {showAnnouncement && (
        <div className="bg-charcoal text-ivory text-center text-[11px] tracking-widest uppercase py-2 px-4">
          {announcement.text}
        </div>
      )}
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppButton />
    </>
  );
}
