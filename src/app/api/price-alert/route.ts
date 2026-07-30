import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { email, productId, desiredPrice } = await req.json();

    if (!email || !productId || desiredPrice == null) {
      return NextResponse.json({ error: "email, productId, and desiredPrice are required" }, { status: 400 });
    }

    const alert = {
      email: email.toLowerCase().trim(),
      productId,
      desiredPrice: Number(desiredPrice),
      currentPrice: 0,
      createdAt: Timestamp.now(),
      notified: false,
    };

    const docRef = await addDoc(collection(db, "priceAlerts"), alert);
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
