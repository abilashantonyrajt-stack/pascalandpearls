"use client";

import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import { useSiteContent } from "@/context/SiteContentContext";

export default function Footer() {
  const content = useSiteContent();
  const footer = content.footer_content;

  return (
    <footer className="bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-light tracking-[0.15em] mb-4 text-gold">
              PASCAL &amp; PEARLS
            </h3>
            {footer?.active && footer?.description ? (
              <p className="text-sm text-ivory/60 leading-relaxed whitespace-pre-line">{footer.description}</p>
            ) : (
              <p className="text-sm text-ivory/60 leading-relaxed">
                Handcrafted artisan jewelry and pearl sets, made with love and
                attention to every detail.
              </p>
            )}
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase mb-4 text-ivory/80">Shop</h4>
            <ul className="space-y-2">
              {["Necklaces", "Bracelets", "Earrings", "Sets"].map((item) => (
                <li key={item}>
                  <Link href={`/shop?category=${item.toLowerCase()}`} className="text-sm text-ivory/50 hover:text-gold transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase mb-4 text-ivory/80">Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-ivory/50 hover:text-gold transition-colors">About</Link></li>
              <li><Link href="/blog" className="text-sm text-ivory/50 hover:text-gold transition-colors">Blog</Link></li>
              <li><Link href="/collections" className="text-sm text-ivory/50 hover:text-gold transition-colors">Collections</Link></li>
              <li><Link href="/wishlist" className="text-sm text-ivory/50 hover:text-gold transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase mb-4 text-ivory/80">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm text-ivory/50 hover:text-gold transition-colors">Contact Us</Link></li>
              <li><Link href="/track-order" className="text-sm text-ivory/50 hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link href="/referral" className="text-sm text-ivory/50 hover:text-gold transition-colors">Refer a Friend</Link></li>
              <li><Link href="/privacy" className="text-sm text-ivory/50 hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-ivory/50 hover:text-gold transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest uppercase mb-4 text-ivory/80">Newsletter</h4>
            <NewsletterForm />
          </div>
        </div>
        <div className="border-t border-ivory/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/40 tracking-wider">
          <p>{footer?.active && footer?.copyright ? footer.copyright : `\u00A9 ${new Date().getFullYear()} Pascal & Pearls. All rights reserved.`}</p>
          <div className="flex gap-4">
            <Link href="/blog" className="hover:text-gold transition-colors">Blog</Link>
            <Link href="/referral" className="hover:text-gold transition-colors">Referral</Link>
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-gold transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
