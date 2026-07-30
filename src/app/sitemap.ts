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
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/track-order`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${BASE_URL}/referral`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
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
