import type { Metadata } from "next";
import { getProduct } from "@/lib/products";

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: "Product Not Found | Pascal & Pearls" };
  }
  return {
    title: `${product.name} | Pascal & Pearls`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Pascal & Pearls`,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
