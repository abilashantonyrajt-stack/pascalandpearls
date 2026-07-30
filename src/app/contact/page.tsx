import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Pascal & Pearls",
  description: "Get in touch with Pascal & Pearls. We'd love to hear from you — questions, custom orders, or just to say hello.",
};

export default function ContactPage() {
  return (
    <main className="bg-ivory min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-[0.15em] text-charcoal mb-2 text-center">Get in Touch</h1>
        <p className="text-sm text-mink text-center mb-12">
          Have a question, custom order request, or just want to say hello? We&apos;d love to hear from you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="glass p-6 text-center">
            <Mail size={20} className="mx-auto mb-3 text-mink" />
            <h3 className="text-sm tracking-widest uppercase text-charcoal mb-1">Email</h3>
            <a href="mailto:antonyabilash51@gmail.com" className="text-sm text-mink hover:underline">antonyabilash51@gmail.com</a>
          </div>
          <div className="glass p-6 text-center">
            <Phone size={20} className="mx-auto mb-3 text-mink" />
            <h3 className="text-sm tracking-widest uppercase text-charcoal mb-1">Phone</h3>
            <a href="tel:+918073379266" className="text-sm text-mink hover:underline">+91 80733 79266</a>
          </div>
          <div className="glass p-6 text-center">
            <MessageCircle size={20} className="mx-auto mb-3 text-mink" />
            <h3 className="text-sm tracking-widest uppercase text-charcoal mb-1">WhatsApp</h3>
            <a href="https://wa.me/918073379266?text=Hi%20Pascal%20%26%20Pearls" target="_blank" rel="noopener noreferrer" className="text-sm text-mink hover:underline">Chat with us</a>
          </div>
          <div className="glass p-6 text-center">
            <MapPin size={20} className="mx-auto mb-3 text-mink" />
            <h3 className="text-sm tracking-widest uppercase text-charcoal mb-1">Location</h3>
            <p className="text-sm text-charcoal/60">India</p>
          </div>
        </div>

        <div className="text-center text-sm text-charcoal/60">
          <p className="mb-4">We typically respond within 24 hours on business days.</p>
          <Link href="/shop" className="inline-block text-xs tracking-widest uppercase bg-charcoal text-ivory px-8 py-3 hover:bg-charcoal-deep transition-colors">
            Browse Collection
          </Link>
        </div>
      </div>
    </main>
  );
}
