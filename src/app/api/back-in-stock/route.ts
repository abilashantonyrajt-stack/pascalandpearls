import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { productId, email } = await req.json();

    if (!productId || !email) {
      return NextResponse.json({ error: "Missing productId or email" }, { status: 400 });
    }

    await addDoc(collection(db, "backInStock"), {
      productId,
      email,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true, message: "We'll email you when this product is back in stock!" });
  } catch (err: any) {
    console.error("back-in-stock error:", err);
    return NextResponse.json({ error: err.message || "Failed to register" }, { status: 500 });
  }
}
