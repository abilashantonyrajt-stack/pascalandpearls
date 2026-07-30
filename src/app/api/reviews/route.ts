import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  const snap = await getDocs(query(collection(db, "reviews"), where("productId", "==", productId), orderBy("createdAt", "desc")));
  const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  try {
    const { productId, name, rating, comment } = await req.json();
    if (!productId || !name || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const ref = await addDoc(collection(db, "reviews"), {
      productId,
      name,
      rating: Number(rating),
      comment: comment || "",
      createdAt: Timestamp.now(),
    });
    return NextResponse.json({ id: ref.id, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
