import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { key, data } = await req.json();
    if (!key || !data) {
      return NextResponse.json({ error: "Missing key or data" }, { status: 400 });
    }

    await setDoc(doc(db, "siteContent", key), data, { merge: true });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Content save error:", e);
    return NextResponse.json({ error: e.message || "Failed to save content" }, { status: 500 });
  }
}
