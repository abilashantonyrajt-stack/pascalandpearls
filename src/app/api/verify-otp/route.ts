import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, deleteDoc, addDoc, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { email, otp, name } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Missing email or OTP" }, { status: 400 });
    }

    const otpsRef = collection(db, "otps");
    const q = query(otpsRef, where("email", "==", email), where("code", "==", otp));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (data.expiresAt?.toMillis() < Date.now()) {
      await deleteDoc(doc.ref);
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    await deleteDoc(doc.ref);

    if (name) {
      await addDoc(collection(db, "users"), {
        name,
        email,
        createdAt: Timestamp.now(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: err.message || "Failed to verify OTP" }, { status: 500 });
  }
}
