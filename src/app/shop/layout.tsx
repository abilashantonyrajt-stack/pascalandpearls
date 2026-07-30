import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Pascal & Pearls",
  description:
    "Browse our full collection of handcrafted beaded jewelry and artificial pearl sets. Find the perfect piece for every occasion.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
