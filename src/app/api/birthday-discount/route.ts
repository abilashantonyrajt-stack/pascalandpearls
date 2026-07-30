import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { email, name, dateOfBirth } = await req.json();

    if (!email || !name || !dateOfBirth) {
      return NextResponse.json({ error: "Missing email, name, or dateOfBirth" }, { status: 400 });
    }

    await addDoc(collection(db, "birthdayDiscounts"), {
      email,
      name,
      dateOfBirth,
      createdAt: Timestamp.now(),
      discountGiven: false,
    });

    return NextResponse.json({ success: true, message: "You'll receive a special discount on your birthday!" });
  } catch (err: any) {
    console.error("birthday-discount error:", err);
    return NextResponse.json({ error: err.message || "Failed to register" }, { status: 500 });
  }
}
