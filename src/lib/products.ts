import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

export interface ProductVariant {
  name: string;
  price?: number;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  description: string;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
  createdAt: number;
  material?: string;
  variants?: ProductVariant[];
}

const PRODUCTS_COLLECTION = "products";

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Product
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("category", "==", category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Product
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("featured", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Product
  );
}
