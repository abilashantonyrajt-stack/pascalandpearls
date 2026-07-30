import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Collections | Pascal & Pearls",
  description:
    "Explore our curated collections of handcrafted beaded jewelry and artificial pearl sets — from delicate pearl drops to statement necklaces and elegant bridal sets.",
};

const collections = [
  {
    name: "Pearl Drop Collection",
    description:
      "Delicate freshwater pearl pendants and drop earrings that capture light with every movement. Perfect for bridal wear and evening occasions.",
    gradient: "bg-[linear-gradient(135deg,_#F5EDE0_0%,_#E8D5C4_50%,_#D4B88C_100%)]",
    href: "/shop?category=necklaces",
    pieces: "12 pieces",
  },
  {
    name: "Gemstone Bead Collection",
    description:
      "Vibrant hand-beaded pieces featuring semi-precious gemstones. Each bead is individually selected and woven by skilled artisans.",
    gradient: "bg-[linear-gradient(135deg,_#F0E6D6_0%,_#C9A96E_100%)]",
    href: "/shop?category=bracelets",
    pieces: "18 pieces",
  },
  {
    name: "Bridal Ensemble",
    description:
      "Complete bridal sets featuring matching necklaces, earrings, and bracelets. Each ensemble is designed to complement traditional and contemporary bridal wear.",
    gradient: "bg-[linear-gradient(135deg,_#E8E0D8_0%,_#B8934E_100%)]",
    href: "/shop?category=sets",
    pieces: "8 sets",
  },
  {
    name: "Minimalist Pearl",
    description:
      "Everyday elegance with simple, modern designs. Single-strand pearl bracelets and subtle drop earrings for the contemporary woman.",
    gradient: "bg-[linear-gradient(135deg,_#FDF8F0_0%,_#E8D5C4_100%)]",
    href: "/shop?category=earrings",
    pieces: "15 pieces",
  },
];

export default function CollectionsPage() {
  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-4">
            Curated Selections
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-charcoal">
            Our Collections
          </h1>
          <p className="text-sm text-mink mt-4 max-w-lg mx-auto">
            Discover thoughtfully curated collections, each telling its own unique
            story through carefully selected materials and designs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 gap-12">
          {collections.map((col, i) => (
            <div
              key={col.name}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                i % 2 === 1 ? "lg:direction-rtl" : ""
              }`}
            >
              <div
                className={`aspect-[4/3] ${col.gradient} rounded-sm order-1 ${
                  i % 2 === 1 ? "lg:order-2" : ""
                }`}
              />
              <div className={`order-2 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <p className="text-xs tracking-widest uppercase text-gold-dark mb-2">
                  {col.pieces}
                </p>
                <h2 className="text-xl sm:text-2xl font-light text-charcoal mb-4">
                  {col.name}
                </h2>
                <p className="text-sm text-mink leading-relaxed mb-6">
                  {col.description}
                </p>
                <Link
                  href={col.href}
                  className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal hover:text-gold transition-colors"
                >
                  Explore Collection <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
