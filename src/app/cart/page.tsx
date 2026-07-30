"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, ImageOff } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  const [brokenImgs, setBrokenImgs] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <div className="bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <ShoppingBag size={40} className="mx-auto text-mink/50 mb-4" />
          <h1 className="text-xl font-light text-charcoal mb-2">Your bag is empty</h1>
          <p className="text-sm text-mink mb-6">
            Discover our collection of handcrafted jewelry.
          </p>
          <Link
            href="/shop"
            className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-light text-charcoal">
            Shopping Bag
          </h1>
          <p className="text-sm text-mink mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-stone text-xs tracking-widest uppercase text-mink">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {items.map((item) => (
          <div
            key={item.productId}
            className="grid grid-cols-12 gap-4 py-6 border-b border-stone/50 items-center"
          >
            <div className="col-span-12 sm:col-span-6 flex gap-4">
              <div className="w-20 h-20 bg-cream rounded flex-shrink-0 overflow-hidden">
                {brokenImgs[item.productId] ? (
                  <div className="w-full h-full flex items-center justify-center text-mink/30">
                    <ImageOff size={20} />
                  </div>
                ) : (
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={() => setBrokenImgs((prev) => ({ ...prev, [item.productId]: true }))}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <Link
                  href={`/shop/${item.productId}`}
                  className="text-sm text-charcoal hover:text-gold-dark transition-colors"
                >
                  {item.name}
                </Link>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="flex items-center gap-1 text-xs text-mink/60 hover:text-red-500 transition-colors mt-2"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>

            <div className="col-span-4 sm:col-span-2 text-center">
              <span className="sm:hidden text-[11px] tracking-wider text-mink mr-2">
                Price:
              </span>
              <span className="text-sm text-charcoal">{formatPrice(item.price)}</span>
            </div>

            <div className="col-span-4 sm:col-span-2 flex items-center justify-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="p-1 text-charcoal/50 hover:text-charcoal border border-stone"
              >
                <Minus size={12} />
              </button>
              <span className="text-sm w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="p-1 text-charcoal/50 hover:text-charcoal border border-stone"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="col-span-4 sm:col-span-2 text-right">
              <span className="sm:hidden text-[11px] tracking-wider text-mink mr-2">
                Total:
              </span>
              <span className="text-sm text-charcoal font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          <div className="text-right">
            <p className="text-xs tracking-widest uppercase text-mink mb-1">
              Subtotal
            </p>
            <p className="text-2xl text-charcoal font-light">
              {formatPrice(subtotal)}
            </p>
            <p className="text-[11px] text-mink/60 mt-1">
              Shipping &amp; taxes calculated at checkout
            </p>
          </div>
        </div>

        <div className="mt-8 text-right">
          <Link
            href="/checkout"
            className="inline-block text-xs tracking-widest uppercase bg-charcoal text-ivory px-10 py-4 hover:bg-charcoal-deep transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
