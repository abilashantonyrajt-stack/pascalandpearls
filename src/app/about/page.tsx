import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Sparkles, Shield, Feather } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Pascal & Pearls",
  description:
    "Discover the story behind Pascal & Pearls — where timeless elegance meets artisan craftsmanship. Handcrafted beaded jewelry and pearl sets made with passion.",
};

const values = [
  {
    icon: Heart,
    title: "Handcrafted with Love",
    description:
      "Every piece is meticulously handcrafted by skilled artisans who pour their heart into each creation.",
  },
  {
    icon: Sparkles,
    title: "Ethical Materials",
    description:
      "We source only ethically harvested pearls and beads, ensuring beauty without compromise.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description:
      "Each piece undergoes rigorous quality checks to ensure it meets our exacting standards.",
  },
  {
    icon: Feather,
    title: "Sustainable Practice",
    description:
      "We embrace slow fashion — creating timeless pieces designed to be cherished for generations.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-ivory">
      <div className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-4">
            Our Story
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-charcoal max-w-3xl mx-auto leading-tight">
            Where Timeless Elegance Meets Artisan Craftsmanship
          </h1>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-xl sm:text-2xl font-light text-charcoal mb-4">
              The Pascal &amp; Pearls Story
            </h2>
            <div className="space-y-4 text-sm text-mink leading-relaxed">
              <p>
                Pascal &amp; Pearls was born from a simple belief: that jewelry
                should tell a story. Our founder, inspired by the timeless elegance
                of freshwater pearls and the delicate art of bead weaving, set out
                to create pieces that capture moments of beauty.
              </p>
              <p>
                What began as a small workshop has grown into a curated collection
                of handcrafted adornments, each piece reflecting our commitment to
                quality, artistry, and ethical practices.
              </p>
              <p>
                Today, we work with a network of skilled artisans across the
                country, preserving traditional techniques while embracing
                contemporary designs that speak to the modern woman.
              </p>
            </div>
          </div>
          <div className="aspect-[4/5] bg-cream-dark" />
        </div>

        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
            Our Values
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-charcoal">
            What We Stand For
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {values.map((v) => (
            <div key={v.title} className="p-6 glass-strong">
              <v.icon size={20} className="text-gold-dark mb-4" />
              <h3 className="text-sm tracking-widest uppercase text-charcoal mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-mink leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-strong py-16 sm:py-20 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-light text-charcoal mb-4">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-sm text-mink mb-8">
            Explore our collection of handcrafted jewelry, each piece waiting to
            become part of your story.
          </p>
          <Link
            href="/shop"
            className="inline-block text-xs tracking-widest uppercase bg-charcoal text-ivory px-8 py-4 hover:bg-charcoal-deep transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
