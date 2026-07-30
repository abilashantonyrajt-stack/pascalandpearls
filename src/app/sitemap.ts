import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "@/lib/products";

const BASE_URL = "https://pascal-and-pearls.vercel.app";

export default async function sitemap() {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/collections`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  try {
    const products = await getDocs(collection(db, "products"));
    const productUrls = products.docs.map((d) => {
      const p = d.data() as Product;
      return {
        url: `${BASE_URL}/shop/${d.id}`,
        lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });
    return [...staticPages, ...productUrls];
  } catch {
    return staticPages;
  }
}
