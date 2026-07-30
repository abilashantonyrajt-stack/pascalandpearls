"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/products";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div className="group">
      <Link href={`/shop/${product.id}`}>
        <div className="aspect-[3/4] glass overflow-hidden mb-3 relative">
          <Image
            src={imgError ? FALLBACK_IMG : product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-3 py-1.5">Sold Out</span>
            </div>
          )}
          {lowStock && (
            <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase bg-amber-100 text-amber-800 px-2 py-1">Only {product.stock} left</span>
          )}
        </div>
      </Link>
      <div className="px-1">
        <p className="text-[11px] tracking-widest uppercase text-mink mb-1">
          {product.category}
        </p>
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-sm text-charcoal hover:text-gold-dark transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-charcoal font-medium">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => {
              if (outOfStock) return;
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
              });
            }}
            className={`p-2 transition-colors ${outOfStock ? "text-mink/30 cursor-not-allowed" : "text-charcoal/50 hover:text-gold"}`}
            aria-label="Add to bag"
            disabled={outOfStock}
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
