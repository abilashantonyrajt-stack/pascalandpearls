"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({ productId: item.id, name: item.name, price: item.price, image: item.image });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; }), 1500);
  };

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={20} className="text-mink" />
          <h1 className="text-xl font-light text-charcoal tracking-widest uppercase">My Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={40} className="mx-auto text-mink/30 mb-4" />
            <p className="text-mink text-sm mb-6">Your wishlist is empty.</p>
            <Link href="/shop" className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors inline-block">Browse Shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="glass-card overflow-hidden group">
                <Link href={`/shop/${item.id}`} className="block aspect-[4/5] bg-cream overflow-hidden relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={(e) => { e.preventDefault(); removeItem(item.id); }} className="absolute top-3 right-3 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                    <Trash2 size={14} className="text-mink" />
                  </button>
                </Link>
                <div className="p-4">
                  <p className="text-xs tracking-widest uppercase text-mink mb-1 truncate">{item.name}</p>
                  <p className="text-sm text-charcoal mb-3">₹{item.price}</p>
                  <button onClick={() => handleAddToCart(item)} className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory py-3 hover:bg-charcoal-deep transition-colors">
                    <ShoppingBag size={14} />
                    {addedIds.has(item.id) ? "Added!" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
