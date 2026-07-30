"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, ChevronLeft, ShoppingBag, Heart, Shield, Truck, RefreshCw, X, LoaderCircle, Share2 } from "lucide-react";
import { getProductsByCategory } from "@/lib/products";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const { addItem } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, "products", id),
      (snap) => {
        if (!snap.exists()) {
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() } as Product;
        setProduct(data);
        getProductsByCategory(data.category).then((cats) => {
          setRelated(cats.filter((p) => p.id !== id).slice(0, 4));
        });
        try {
          const viewed = JSON.parse(localStorage.getItem("pnp_recently") || "[]");
          const filtered = viewed.filter((v: any) => v.id !== data.id);
          filtered.unshift({ id: data.id, name: data.name, price: data.price, image: data.images[0] || "", category: data.category });
          localStorage.setItem("pnp_recently", JSON.stringify(filtered.slice(0, 8)));
        } catch {}
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load product:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-[4/5] bg-cream-dark" />
            <div className="space-y-4">
              <div className="h-4 bg-cream-dark w-1/4" />
              <div className="h-8 bg-cream-dark w-3/4" />
              <div className="h-6 bg-cream-dark w-1/4" />
              <div className="h-20 bg-cream-dark w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-mink text-sm mb-4">Product not found</p>
          <Link
            href="/shop"
            className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const FALLBACK_IMG = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600";
  const images = product.images.length > 0 ? product.images : [FALLBACK_IMG];
  const wishlisted = isWishlisted(product.id);
  const variant = product.variants?.find((v) => v.name === selectedVariant) ?? null;
  const displayPrice = product.price + (variant?.price ?? 0);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors mb-6"
        >
          <ChevronLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="space-y-4">
            <button onClick={() => setLightboxOpen(true)} className="aspect-[4/5] bg-cream overflow-hidden relative w-full text-left cursor-zoom-in">
              {imgErrors[selectedImage] ? (
                <div className="w-full h-full flex items-center justify-center text-mink/40">
                  <ImageOff size={40} />
                </div>
              ) : (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  onError={() => setImgErrors((prev) => ({ ...prev, [selectedImage]: true }))}
                />
              )}
            </button>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 bg-cream overflow-hidden border-2 transition-colors relative ${selectedImage === i ? "border-gold" : "border-transparent"}`}
                  >
                    {imgErrors[i] ? (
                      <div className="w-full h-full flex items-center justify-center text-mink/30">
                        <ImageOff size={16} />
                      </div>
                    ) : (
                      <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-widest uppercase text-mink mb-2">
                  {product.category}
                </p>
                <h1 className="text-2xl sm:text-3xl font-light text-charcoal mb-3">
                  {product.name}
                </h1>
              </div>
              <div className="flex items-center gap-1">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at Pascal & Pearls!\nhttps://pascal-and-pearls.vercel.app/shop/${product.id}`)}`} target="_blank" rel="noopener noreferrer" className="p-2 text-mink/40 hover:text-green-500 transition-colors" aria-label="Share on WhatsApp">
                  <Share2 size={18} />
                </a>
                <button onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price, image: images[0] })} className={`shrink-0 p-2 transition-colors ${wishlisted ? "text-red-400" : "text-mink/40 hover:text-red-300"}`}>
                  <Heart size={22} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-gold-dark font-medium mb-6">
              {formatPrice(displayPrice)}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant === v.name;
                  const priceDiff = v.price ?? 0;
                  return (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVariant(isSelected ? null : v.name)}
                      className={`px-4 py-2 text-xs tracking-wider uppercase rounded-full border transition-colors ${
                        isSelected
                          ? "bg-charcoal text-ivory border-charcoal"
                          : "bg-transparent text-mink border-stone hover:border-charcoal hover:text-charcoal"
                      }`}
                    >
                      {v.name}
                      <span className="ml-1 opacity-70">
                        {priceDiff === 0 ? "Base" : `+${formatPrice(priceDiff)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="border-t border-stone pt-6 mb-6">
              <p className="text-sm text-mink leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.material && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-charcoal mb-1">
                  Material
                </p>
                <p className="text-sm text-mink">{product.material}</p>
              </div>
            )}

            <button
              onClick={() => {
                addItem({
                  productId: product.id,
                  name: product.name + (variant ? ` (${variant.name})` : ""),
                  price: displayPrice,
                  image: images[0],
                });
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              className="w-full flex items-center justify-center gap-3 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors mb-4"
            >
              <ShoppingBag size={16} />
              {added ? "Added to Bag" : "Add to Bag"}
            </button>

            <div className="grid grid-cols-2 gap-4 py-6 border-t border-stone">
              {[
                { icon: Shield, label: "Secure Checkout" },
                { icon: Truck, label: "Free Shipping" },
                { icon: RefreshCw, label: "Easy Returns" },
                { icon: Heart, label: "Handcrafted" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={14} className="text-gold-dark" />
                  <span className="text-[11px] tracking-wider text-mink">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone">
            <h2 className="text-lg tracking-widest uppercase text-charcoal mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        <ReviewSection productId={product.id} />
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
            <X size={28} />
          </button>
          <img src={images[selectedImage]} alt={product.name} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`).then((r) => r.json()).then(setReviews).catch(() => {});
  }, [productId]);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, name: name.trim(), rating, comment: comment.trim() }) });
      setDone(true);
      setName(""); setRating(5); setComment("");
      const res = await fetch(`/api/reviews?productId=${productId}`);
      setReviews(await res.json());
      setTimeout(() => setDone(false), 2000);
    } catch {}
    setSubmitting(false);
  }

  return (
    <div className="mt-16 pt-12 border-t border-stone">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg tracking-widest uppercase text-charcoal">Reviews</h2>
        {avgRating && <span className="text-sm text-mink">({avgRating} avg — {reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>}
      </div>

      {reviews.length === 0 && <p className="text-sm text-mink mb-6">No reviews yet. Be the first!</p>}

      {reviews.length > 0 && (
        <div className="space-y-3 mb-8 max-w-lg">
          {reviews.map((r: any) => (
            <div key={r.id} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-charcoal">{r.name}</span>
                <span className="text-gold-dark text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p className="text-sm text-mink">{r.comment}</p>}
              <p className="text-[10px] text-mink/50 mt-1">{new Date(r.createdAt?.toMillis()).toLocaleDateString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-3">
        <h3 className="text-xs tracking-widest uppercase text-mink">Write a Review</h3>
        <div className="flex gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="flex-1 glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" required />
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="glass-input px-3 py-3 text-sm text-charcoal focus:outline-none">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>)}
          </select>
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your review (optional)" rows={2} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none resize-none" />
        <button type="submit" disabled={submitting} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-50">
          {submitting ? "Submitting..." : done ? "Submitted!" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
