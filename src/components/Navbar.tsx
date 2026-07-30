"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, User, Package, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
];

export default function Navbar({ onCartOpen }: { onCartOpen?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();

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
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3 text-xs text-mink mr-2">
                <span>{user?.name}</span>
                <Link href="/wishlist" className="flex items-center gap-1 text-mink/60 hover:text-charcoal transition-colors relative"><Heart size={12} /> Wishlist{wishlistCount > 0 && <span className="text-[10px] bg-gold text-white w-3.5 h-3.5 rounded-full flex items-center justify-center absolute -top-1.5 -right-3.5">{wishlistCount}</span>}</Link>
                <Link href="/my-orders" className="flex items-center gap-1 text-mink/60 hover:text-charcoal transition-colors"><Package size={12} /> Orders</Link>
                <button onClick={logout} className="text-mink/60 hover:text-red-500">Logout</button>
              </div>
            ) : (
              <Link href="/auth" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors mr-2">
                <User size={14} /> Sign In
              </Link>
            )}
            <Link href="/wishlist" className="relative p-2 text-charcoal/70 hover:text-gold transition-colors" aria-label="Wishlist">
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
              aria-label="Open cart"
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
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link href="/my-orders" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2">
                  My Orders
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block text-sm tracking-widest uppercase text-red-400 hover:text-red-500 transition-colors py-2 w-full text-left">
                  Sign Out ({user?.name})
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={() => setMenuOpen(false)} className="block text-sm tracking-widest uppercase text-charcoal/70 hover:text-gold transition-colors py-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
