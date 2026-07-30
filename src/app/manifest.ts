import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pascal & Pearls | Artisan Handcrafted Jewelry & Pearl Sets",
    short_name: "P&P",
    description: "Handcrafted beaded jewelry and artificial pearl sets — timeless elegance, handmade with passion.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#3a3a3a",
    categories: ["shopping", "lifestyle", "fashion"],
    screenshots: [
      { src: "/screenshot-mobile.svg", sizes: "390x844", type: "image/svg+xml", form_factor: "narrow" },
    ],
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
