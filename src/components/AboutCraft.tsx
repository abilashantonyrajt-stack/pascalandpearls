"use client";

import { useSiteContent } from "@/context/SiteContentContext";

export default function AboutCraft() {
  const content = useSiteContent();
  const about = content.about_section;

  if (about?.active) {
    return (
      <section className="glass-strong py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="aspect-[4/5] glass rounded-sm overflow-hidden" style={about.image ? { backgroundImage: `url(${about.image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
              {!about.image && (
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--color-gold-light)_0%,_var(--color-cream)_70%)] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-2xl text-gold-dark">✦</span>
                    </div>
                    <p className="text-xs tracking-[0.3em] uppercase text-gold-dark">Handmade with Love</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              {about.title && <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-charcoal mb-6">{about.title}</h2>}
              {about.content && (
                <div className="space-y-4 text-sm text-mink leading-relaxed whitespace-pre-line">
                  {about.content}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-strong py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="aspect-[4/5] glass rounded-sm overflow-hidden">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--color-gold-light)_0%,_var(--color-cream)_70%)] flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-2xl text-gold-dark">✦</span>
                </div>
                <p className="text-xs tracking-[0.3em] uppercase text-gold-dark">
                  Handmade with Love
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-4">
              Our Story
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-charcoal mb-6">
              The Art of Handcrafted Jewelry
            </h2>
            <div className="space-y-4 text-sm text-mink leading-relaxed">
              <p>
                At Pascal &amp; Pearls, every piece begins as a vision — a
                delicate dance of color, texture, and form. Named after the
                timeless elegance of pearls and the quiet strength of Pascal, our
                boutique celebrates the art of slow, mindful craftsmanship.
              </p>
              <p>
                Each bead is carefully selected, each pearl hand-knotted, and
                every closure secured with precision. We work with ethically
                sourced materials, partnering with skilled artisans who have
                perfected their craft over generations.
              </p>
              <p>
                From our hands to yours, every creation carries a piece of our
                heart — a reminder that true luxury lies in the details.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              {[
                { number: "200+", label: "Artisan Pieces" },
                { number: "100%", label: "Handcrafted" },
                { number: "5K+", label: "Happy Clients" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl sm:text-2xl text-gold-dark font-light">
                    {stat.number}
                  </p>
                  <p className="text-[10px] tracking-widest uppercase text-mink mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
