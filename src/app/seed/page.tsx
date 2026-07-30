"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, updateDoc } from "firebase/firestore";

const products = [
  { name: "Classic Freshwater Pearl Necklace", price: 2499, description: "A timeless strand of lustrous freshwater pearls, hand-knotted with silk thread and finished with a 14K gold-plated clasp.", images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", "https://images.unsplash.com/photo-1591218110463-dbe2cc2ce1ca?w=600"], category: "necklaces", stock: 15, featured: true, material: "Freshwater Pearls, 14K Gold-Plated Clasp, Silk Thread", createdAt: Date.now() },
  { name: "Golden Beaded Choker Set", price: 1899, description: "An exquisite choker set featuring hand-beaded gold-toned glass beads with a matching pair of drop earrings.", images: ["https://images.unsplash.com/photo-1739194840257-0035eaafc61e?w=600", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600"], category: "sets", stock: 10, featured: true, material: "Gold-Plated Glass Beads, Brass Alloy", createdAt: Date.now() - 1e5 },
  { name: "Rose Quartz Beaded Bracelet", price: 899, description: "A delicate bracelet featuring genuine rose quartz beads with gold spacers.", images: ["https://images.unsplash.com/photo-1721103418312-b0057a8c31c2?w=600", "https://images.unsplash.com/photo-1769116416641-e714b71851e8?w=600"], category: "bracelets", stock: 25, featured: false, material: "Rose Quartz, Gold-Plated Spacers", createdAt: Date.now() - 2e5 },
  { name: "Pearl Drop Earrings", price: 1299, description: "Elegant drop earrings featuring baroque freshwater pearls suspended from gold-filled hooks.", images: ["https://images.unsplash.com/photo-1748679451184-97ddab571605?w=600", "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600"], category: "earrings", stock: 20, featured: true, material: "Baroque Freshwater Pearls, Gold-Filled Hooks", createdAt: Date.now() - 3e5 },
  { name: "Multicolor Gemstone Necklace", price: 3199, description: "A vibrant statement necklace handcrafted with alternating amethyst, citrine, and peridot beads.", images: ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600", "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600"], category: "necklaces", stock: 8, featured: false, material: "Amethyst, Citrine, Peridot", createdAt: Date.now() - 4e5 },
  { name: "Pearl & Crystal Bridal Set", price: 4999, description: "A complete bridal ensemble featuring a pearl and crystal necklace, matching earrings, and a coordinating bracelet.", images: ["https://images.unsplash.com/photo-1591218110463-dbe2cc2ce1ca?w=600", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600"], category: "sets", stock: 5, featured: true, material: "Freshwater Pearls, Swarovski Crystals", createdAt: Date.now() - 5e5 },
  { name: "Layered Pearl Bracelet Stack", price: 1499, description: "A set of three stackable bracelets combining freshwater pearls, gold beads, and clear crystals.", images: ["https://images.unsplash.com/photo-1769116416641-e714b71851e8?w=600", "https://images.unsplash.com/photo-1739194840257-0035eaafc61e?w=600"], category: "bracelets", stock: 18, featured: false, material: "Freshwater Pearls, Crystal Beads", createdAt: Date.now() - 6e5 },
  { name: "Turquoise Bead Drop Earrings", price: 1099, description: "Southwest-inspired drop earrings featuring natural turquoise beads with silver accent spacers.", images: ["https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600", "https://images.unsplash.com/photo-1748679451184-97ddab571605?w=600"], category: "earrings", stock: 22, featured: false, material: "Natural Turquoise, Sterling Silver", createdAt: Date.now() - 7e5 },
  { name: "Gold Pearl Lariat Necklace", price: 2799, description: "A modern lariat-style necklace combining cultured pearls with gold-plated chain.", images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600"], category: "necklaces", stock: 12, featured: false, material: "Cultured Pearls, Gold-Plated Chain", createdAt: Date.now() - 8e5 },
  { name: "Beaded Wrap Bracelet", price: 699, description: "A versatile wrap bracelet featuring tiny seed beads in earthy tones.", images: ["https://images.unsplash.com/photo-1721103418312-b0057a8c31c2?w=600", "https://images.unsplash.com/photo-1769116416641-e714b71851e8?w=600"], category: "bracelets", stock: 30, featured: false, material: "Glass Seed Beads, Waxed Cotton Cord", createdAt: Date.now() - 9e5 },
  { name: "Pearl Stud Earrings Set", price: 799, description: "A set of three pearl stud earrings in graduated sizes.", images: ["https://images.unsplash.com/photo-1748679451184-97ddab571605?w=600", "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600"], category: "earrings", stock: 35, featured: false, material: "Freshwater Pearls, Sterling Silver Posts", createdAt: Date.now() - 1e6 },
  { name: "Ruby & Pearl Combo Set", price: 3999, description: "A striking combination set featuring ruby-red glass beads alternating with lustrous pearls.", images: ["https://images.unsplash.com/photo-1591218110463-dbe2cc2ce1ca?w=600", "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600"], category: "sets", stock: 7, featured: true, material: "Ruby Glass Beads, Freshwater Pearls", createdAt: Date.now() - 1.1e6 },
];

function wait(ms: number) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms));
}

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "seeding" | "fixing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "fixing") return;
    let cancelled = false;
    async function run() {
      try {
        setMessage("Reading products from Firestore...");
        const col = collection(db, "products");
        const snapshot = await getDocs(col);
        const docs = snapshot.docs;
        setMessage(`Found ${docs.length} products. Updating images...`);
        for (let i = 0; i < docs.length; i++) {
          if (cancelled) return;
          const d = docs[i];
          const data = d.data();
          const match = products.find((p) => p.name === data.name);
          if (match) {
            await Promise.race([
              updateDoc(d.ref, { images: match.images }),
              wait(15000),
            ]);
          }
          setCount(i + 1);
        }
        if (!cancelled) {
          setStatus("done");
          setMessage(`Updated images for ${docs.length} products!`);
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(`Error: ${err.message || err}`);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [status]);

  useEffect(() => {
    if (status !== "seeding") return;
    let cancelled = false;

    async function run() {
      setMessage("Connecting to Firestore...");
      const col = collection(db, "products");
      for (let i = 0; i < products.length; i++) {
        if (cancelled) return;
        try {
          setMessage(`Writing product ${i + 1} of ${products.length}: ${products[i].name}...`);
          const docRef = doc(col);
          await Promise.race([
            setDoc(docRef, products[i]),
            wait(15000),
          ]);
          setCount(i + 1);
        } catch (err: any) {
          console.error("Seed error:", err);
          setStatus("error");
          setMessage(`Error on product ${i + 1}: ${err.message || err}`);
          return;
        }
      }
      if (!cancelled) {
        setStatus("done");
        setMessage(`Seeded ${products.length} products successfully!`);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [status]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="bg-cream border border-stone p-8 max-w-md w-full text-center">
        <h1 className="text-sm tracking-widest uppercase text-charcoal mb-4">Seed Database</h1>
        <p className="text-xs text-mink mb-4">Project: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
        {status === "idle" && (
          <div className="space-y-3">
            <button
              onClick={() => setStatus("seeding")}
              className="w-full text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors"
            >
              Start Seeding
            </button>
            <button
              onClick={() => setStatus("fixing")}
              className="w-full text-xs tracking-widest uppercase border border-stone text-mink px-6 py-3 hover:border-charcoal hover:text-charcoal transition-colors"
            >
              Fix Product Images
            </button>
          </div>
        )}
        {(status === "seeding" || status === "fixing") && (
          <div>
            <p className="text-sm text-mink mb-2">{message}</p>
            {count > 0 && (
              <div className="w-full bg-stone h-1 mb-2">
                <div
                  className="bg-gold h-1 transition-all"
                  style={{ width: `${(count / products.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
        {status === "done" && (
          <div>
            <p className="text-sm text-green-600 mb-4">{message}</p>
            <a
              href="/shop"
              className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 inline-block hover:bg-charcoal-deep transition-colors"
            >
              View Shop
            </a>
          </div>
        )}
        {status === "error" && (
          <div>
            <p className="text-sm text-red-500 mb-2">{message}</p>
            <button
              onClick={() => setStatus("idle")}
              className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 mt-2 hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
