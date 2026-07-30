"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, ShoppingBag, ChevronLeft, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import type { Bundle } from "@/lib/bundles";
import type { Product } from "@/lib/products";
import { getProduct } from "@/lib/products";

export default function BundleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { getBundleBySlug } = await import("@/lib/bundles");
        const b = await getBundleBySlug(slug);
        if (!b) { setLoading(false); return; }
        setBundle(b);
        const prods = await Promise.all(b.products.map((pid) => getProduct(pid)));
        setProducts(prods.filter((p): p is Product => p !== null));
      } catch {}
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <LoaderCircle size={24} className="animate-spin text-mink" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-mink text-sm mb-4">Bundle not found</p>
          <Link href="/bundles" className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors">Back to Bundles</Link>
        </div>
      </div>
    );
  }

  const totalPrice = products.reduce((s, p) => s + p.price, 0);
  const discountedPrice = Math.round(totalPrice * (1 - bundle.discountPercent / 100));

  function handleAddAll() {
    products.forEach((p) => {
      addItem({ productId: p.id, name: p.name, price: p.price, image: p.images[0] });
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/bundles" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors mb-6">
          <ChevronLeft size={14} /> Back to Bundles
        </Link>

        <div className="glass-card p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"; }} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold-dark px-3 py-1"><Tag size={12} /> {bundle.discountPercent}% OFF</span>
                <span className="text-xs text-mink">{bundle.products.length} items</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-charcoal mb-3">{bundle.name}</h1>
              <p className="text-sm text-mink mb-6">{bundle.description}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xl text-gold-dark font-medium">{formatPrice(discountedPrice)}</span>
                <span className="text-sm text-mink line-through">{formatPrice(totalPrice)}</span>
                <span className="text-xs text-green-600">Save {formatPrice(totalPrice - discountedPrice)}</span>
              </div>
              <button
                onClick={handleAddAll}
                className="w-full flex items-center justify-center gap-3 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors"
              >
                <ShoppingBag size={16} />
                {added ? "Added to Bag!" : "Add All to Cart"}
              </button>
            </div>
          </div>
        </div>

        <h2 className="text-sm tracking-widest uppercase text-charcoal mb-6">Items in this Bundle</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} className="group">
              <div className="aspect-[3/4] glass overflow-hidden mb-3 relative">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"; }} />
              </div>
              <p className="text-[11px] tracking-widest uppercase text-mink mb-1">{p.category}</p>
              <h3 className="text-sm text-charcoal group-hover:text-gold-dark transition-colors">{p.name}</h3>
              <span className="text-sm text-charcoal font-medium">{formatPrice(p.price)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
