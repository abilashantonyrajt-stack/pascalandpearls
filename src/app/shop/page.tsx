"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import { Filter, ChevronDown } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
];

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    getDocs(collection(db, "categories")).then((snap) => {
      const names = snap.docs.map((d) => d.data().name).filter(Boolean);
      setCategories(["all", ...names]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("pnp_recently") || "[]");
      setRecentlyViewed(stored);
    } catch {}
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "products"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (activeCategory !== "all" && p.category.toLowerCase() !== activeCategory.toLowerCase()) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return result;
  }, [products, activeCategory, sort]);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="border-b border-stone bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-charcoal">
            Shop
          </h1>
          <p className="text-sm text-mink mt-2">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="hidden md:flex items-center gap-4 mb-8 pb-4 border-b border-stone">
          <div className="relative flex-1 max-w-xs">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full glass-input px-4 py-2 text-xs text-charcoal focus:outline-none transition-colors placeholder:text-mink/50" />
          </div>
          {categories.map((cat) => (
            <a
              key={cat}
              href={cat === "all" ? "/shop" : `/shop?category=${cat}`}
              className={`text-xs tracking-widest uppercase transition-colors ${
                activeCategory === cat
                  ? "text-gold-dark font-medium"
                  : "text-mink hover:text-charcoal"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </a>
          ))}
          <div className="ml-auto relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none text-xs tracking-widest uppercase glass-input rounded-none px-4 py-2 pr-8 text-charcoal cursor-pointer focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-mink pointer-events-none" />
          </div>
        </div>

        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="md:hidden flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal mb-4"
        >
          <Filter size={14} /> Filters &amp; Sort
        </button>

        {mobileFilterOpen && (
          <div className="md:hidden mb-6 p-4 glass-strong space-y-4">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full glass-input px-4 py-2 text-xs text-charcoal focus:outline-none transition-colors placeholder:text-mink/50" />
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={cat === "all" ? "/shop" : `/shop?category=${cat}`}
                  className={`text-xs tracking-widest uppercase px-3 py-2 border transition-colors ${
                    activeCategory === cat
                      ? "border-gold text-gold-dark"
                      : "border-stone text-mink hover:text-charcoal"
                  }`}
                >
                  {cat === "all" ? "All" : cat}
                </a>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full text-xs tracking-widest uppercase bg-transparent border border-stone px-3 py-2 text-charcoal focus:outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-cream-dark mb-3" />
                <div className="h-3 bg-cream-dark rounded w-1/3 mb-2" />
                <div className="h-4 bg-cream-dark rounded w-2/3 mb-2" />
                <div className="h-4 bg-cream-dark rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-mink text-sm">No pieces found in this category.</p>
            <a
              href="/shop"
              className="inline-block mt-4 text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors"
            >
              View All
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {recentlyViewed.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-sm tracking-widest uppercase text-charcoal mb-6">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {recentlyViewed.map((item: any) => (
              <a key={item.id} href={`/shop/${item.id}`} className="shrink-0 w-32 group">
                <div className="aspect-square bg-cream overflow-hidden mb-2">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <p className="text-[11px] text-mink truncate">{item.name}</p>
                <p className="text-xs text-charcoal">₹{item.price}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-ivory min-h-screen">
      <div className="glass-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <div className="h-8 bg-cream-dark w-32 animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
