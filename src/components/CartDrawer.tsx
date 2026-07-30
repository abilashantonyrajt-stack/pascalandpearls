"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] glass-drawer z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone">
            <h2 className="text-sm tracking-widest uppercase text-charcoal">
              Cart ({itemCount})
            </h2>
            <button onClick={onClose} className="p-1 text-charcoal/50 hover:text-charcoal transition-colors">
              <X size={18} />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-mink text-sm mb-4">Your bag is empty</p>
              <Link
                href="/shop"
                onClick={onClose}
                className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 py-4 border-b border-stone/50"
                  >
                    <div className="w-20 h-20 bg-cream rounded flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-charcoal truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gold-dark mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-0.5 text-charcoal/50 hover:text-charcoal"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-0.5 text-charcoal/50 hover:text-charcoal"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto p-0.5 text-mink/50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-mink">Subtotal</span>
                  <span className="text-charcoal font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-mink/60 tracking-wider">
                  Shipping &amp; taxes calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full text-center text-xs tracking-widest uppercase bg-charcoal text-ivory py-3.5 hover:bg-charcoal-deep transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
