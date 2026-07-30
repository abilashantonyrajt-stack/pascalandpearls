import Link from "next/link";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    name: "Pearl Ensembles",
    description: "Timeless pearl necklaces and matching sets",
    href: "/shop?category=sets",
    image: "/collections/pearls.jpg",
    className: "sm:col-span-2 sm:row-span-2",
  },
  {
    name: "Artisan Necklaces",
    description: "Hand-beaded statement pieces",
    href: "/shop?category=necklaces",
  },
  {
    name: "Beaded Bracelets",
    description: "Stackable charm and gemstone bracelets",
    href: "/shop?category=bracelets",
  },
];

const placeholderGradients = [
  "bg-[linear-gradient(135deg,_#F5EDE0_0%,_#E8D5C4_50%,_#D4B88C_100%)]",
  "bg-[linear-gradient(135deg,_#F0E6D6_0%,_#C9A96E_100%)]",
  "bg-[linear-gradient(135deg,_#E8E0D8_0%,_#B8934E_100%)]",
];

export default function FeaturedCollections() {
  return (
    <section className="bg-ivory py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
            Curated Selections
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-charcoal">
            Featured Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 auto-rows-[300px] sm:auto-rows-[280px] gap-4 sm:gap-6">
          {collections.map((col, i) => (
            <Link
              key={col.name}
              href={col.href}
              className={`group relative overflow-hidden ${col.className || ""}`}
            >
              <div
                className={`absolute inset-0 ${placeholderGradients[i]} transition-transform duration-500 group-hover:scale-105`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-light text-white mb-1">
                  {col.name}
                </h3>
                <p className="text-sm text-white/70 mb-3">{col.description}</p>
                <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-gold-light group-hover:text-white transition-colors">
                  Explore <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
