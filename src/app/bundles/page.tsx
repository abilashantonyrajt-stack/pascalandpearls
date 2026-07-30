"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Tag } from "lucide-react";
import type { Bundle } from "@/lib/bundles";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const mod = await import("@/lib/bundles");
        const data = await mod.getBundles();
        setBundles(data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <LoaderCircle size={24} className="animate-spin text-mink" />
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-light text-charcoal text-center">Bundle Deals</h1>
          <p className="text-sm text-mink text-center mt-2">Curated sets at exclusive prices</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {bundles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-mink text-sm">No bundles available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <Link key={bundle.id} href={`/bundles/${bundle.slug}`} className="glass-card group overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600";
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg text-charcoal font-medium">{bundle.name}</h3>
                    <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold-dark px-2 py-1">
                      <Tag size={12} /> {bundle.discountPercent}% OFF
                    </span>
                  </div>
                  <p className="text-sm text-mink mb-3 line-clamp-2">{bundle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-mink">{bundle.products.length} items</span>
                    <span className="text-xs tracking-widest uppercase text-charcoal group-hover:text-gold transition-colors">View Bundle →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
