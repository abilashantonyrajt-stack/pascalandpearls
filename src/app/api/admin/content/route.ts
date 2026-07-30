import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { verifyAdminRequest } from "@/lib/admin-check";

export async function POST(req: Request) {
  try {
    const { authorized } = verifyAdminRequest(req);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
