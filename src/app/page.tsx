import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import FeaturedCollections from "@/components/FeaturedCollections";
import AboutCraft from "@/components/AboutCraft";
import InstagramFeed from "@/components/InstagramFeed";

export const metadata: Metadata = {
  title: "Pascal & Pearls | Artisan Handcrafted Jewelry",
  description:
    "Discover exquisite handcrafted beaded jewelry and artificial pearl sets. Pascal & Pearls — timeless elegance, handmade with passion.",
  openGraph: {
    title: "Pascal & Pearls | Artisan Handcrafted Jewelry",
    description:
      "Discover exquisite handcrafted beaded jewelry and artificial pearl sets. Pascal & Pearls — timeless elegance, handmade with passion.",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedCollections />
      <AboutCraft />
      <InstagramFeed />
    </>
  );
}
