import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

export interface Bundle {
  id?: string;
  name: string;
  slug: string;
  description: string;
  products: string[];
  discountPercent: number;
  image: string;
  active: boolean;
}

const BUNDLES_COLLECTION = "bundles";

export async function getBundles(): Promise<Bundle[]> {
  const q = query(collection(db, BUNDLES_COLLECTION), where("active", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Bundle);
}

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  const q = query(collection(db, BUNDLES_COLLECTION), where("slug", "==", slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Bundle;
}

export async function getBundle(id: string): Promise<Bundle | null> {
  const ref = doc(db, BUNDLES_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Bundle;
}
