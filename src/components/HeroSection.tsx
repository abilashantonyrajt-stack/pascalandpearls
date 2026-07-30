"use client";

import Link from "next/link";
import { useSiteContent } from "@/context/SiteContentContext";

export default function HeroSection() {
  const content = useSiteContent();
  const hero = content.hero_banner;

  if (hero?.active) {
    return (
      <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center" style={hero.image ? { backgroundImage: `url(${hero.image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-2xl glass-strong p-8 sm:p-12">
            {hero.headline && (
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light leading-tight text-charcoal mb-6 sm:mb-8">
                {hero.headline}
              </h1>
            )}
            {hero.subtitle && (
              <p className="text-sm sm:text-base text-mink leading-relaxed max-w-lg mb-8 sm:mb-10">
                {hero.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={hero.ctaLink || "/shop"}
                className="inline-flex items-center justify-center text-xs tracking-[0.2em] uppercase bg-charcoal text-ivory px-8 py-4 hover:bg-charcoal-deep transition-colors"
              >
                {hero.cta || "Explore Collection"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-gold-light)_0%,_transparent_60%)] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-stone)_0%,_transparent_50%)]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-2xl glass-strong p-8 sm:p-12">
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-gold-dark mb-4 sm:mb-6">
            Artisan Crafted Since 2024
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light leading-tight text-charcoal mb-6 sm:mb-8">
            Timeless Elegance,
            <br />
            <span className="text-gold">Handcrafted</span> with Passion
          </h1>
          <p className="text-sm sm:text-base text-mink leading-relaxed max-w-lg mb-8 sm:mb-10">
            Discover our exclusive collection of handcrafted beaded jewelry and
            pearl sets, where each piece tells a story of artistry and
            dedication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center text-xs tracking-[0.2em] uppercase bg-charcoal text-ivory px-8 py-4 hover:bg-charcoal-deep transition-colors"
            >
              Explore Collection
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center text-xs tracking-[0.2em] uppercase border border-charcoal/20 text-charcoal px-8 py-4 hover:border-charcoal transition-colors"
            >
              View Collections
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
