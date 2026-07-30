"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, User, Package, Heart, Globe, Moon, Sun, Gift } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useI18n } from "@/i18n/LanguageProvider";
import { useTheme } from "@/context/ThemeContext";
import { useCurrency } from "@/context/CurrencyContext";
import LoyaltyBadge from "./LoyaltyBadge";

const navLinks = [
  { href: "/", labelKey: "nav.home" },
  { href: "/shop", labelKey: "nav.shop" },
  { href: "/collections", labelKey: "nav.collections" },
  { href: "/bundles", labelKey: "nav.bundles" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/about", labelKey: "nav.about" },
];

export default function Navbar({ onCartOpen }: { onCartOpen?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { itemCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { t, lang, setLang, available } = useI18n();
  const { dark, toggle: toggleDark } = useTheme();
  const { currency, setCurrency, available: currencies } = useCurrency();

  return (
    <nav className="sticky top-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-light tracking-[0.2em] text-charcoal">
              PASCAL &amp; PEARLS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 text-xs text-mink mr-2">
              <Link href="/track-order" className="text-mink/60 hover:text-charcoal transition-colors">{t("nav.track")}</Link>
            </div>
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3 text-xs text-mink mr-2">
                <span>{user?.name}</span>
                <LoyaltyBadge />
                <Link href="/wishlist" className="flex items-center gap-1 text-mink/60 hover:text-charcoal transition-colors relative"><Heart size={12} /> {t("nav.wishlist")}{wishlistCount > 0 && <span className="text-[10px] bg-gold text-white w-3.5 h-3.5 rounded-full flex items-center justify-center absolute -top-1.5 -right-3.5">{wishlistCount}</span>}</Link>
                <Link href="/my-orders" className="flex items-center gap-1 text-mink/60 hover:text-charcoal transition-colors"><Package size={12} /> {t("nav.orders")}</Link>
                <button onClick={logout} className="text-mink/60 hover:text-red-500">{t("nav.signOut")}</button>
              </div>
            ) : (
              <Link href="/auth" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors mr-2">
                <User size={14} /> {t("nav.signIn")}
              </Link>
            )}

            <div className="relative">
              <button onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }} className="p-2 text-charcoal/70 hover:text-gold transition-colors text-sm font-medium" title="Currency">
                {currency.symbol}
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full mt-1 glass-strong rounded min-w-[140px] shadow-lg z-50">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-xs tracking-wider transition-colors ${currency.code === c.code ? "bg-charcoal text-ivory" : "text-charcoal hover:bg-stone/30"}`}
                    >
                      {c.symbol} {c.code} — {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }} className="p-2 text-charcoal/70 hover:text-gold transition-colors" title={t("nav.language")}>
                <Globe size={18} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 glass-strong rounded min-w-[140px] shadow-lg z-50">
                  {available.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-xs tracking-wider transition-colors ${lang === l.code ? "bg-charcoal text-ivory" : "text-charcoal hover:bg-stone/30"}`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleDark} className="p-2 text-charcoal/70 hover:text-gold transition-colors" title={t("nav.darkMode")}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link href="/wishlist" className="relative p-2 text-charcoal/70 hover:text-gold transition-colors" aria-label={t("nav.wishlist")}>
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={onCartOpen}
              className="relative p-2 text-charcoal/70 hover:text-gold transition-colors"
              aria-label={t("nav.cart")}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-charcoal/70 hover:text-gold transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone bg-ivory">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <Link href="/track-order" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2">
              {t("nav.track")}
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2">
                  {t("nav.wishlist")} {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link href="/my-orders" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2">
                  {t("nav.orders")}
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block text-sm tracking-widest uppercase text-red-400 hover:text-red-500 transition-colors py-2 w-full text-left">
                  {t("nav.signOut")} ({user?.name})
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2">
                {t("nav.signIn")}
              </Link>
            )}
            <div className="pt-2 border-t border-stone">
              <p className="text-xs tracking-widest uppercase text-mink mb-2">{t("nav.language")}</p>
              <div className="flex flex-wrap gap-1">
                {available.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setMenuOpen(false); }}
                    className={`text-xs px-3 py-1 transition-colors ${lang === l.code ? "bg-charcoal text-ivory" : "text-charcoal bg-stone/30"}`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
              <button onClick={() => { toggleDark(); setMenuOpen(false); }} className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2 mt-2">
                {dark ? <Sun size={14} /> : <Moon size={14} />} {t("nav.darkMode")}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
