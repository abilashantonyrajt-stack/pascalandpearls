import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, amount, senderEmail, senderName, recipientEmail, recipientName, message } = body;
    if (!code || !amount || !senderEmail || !senderName || !recipientEmail || !recipientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const now = new Date();
    const expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const docRef = await addDoc(collection(db, "giftCards"), {
      code,
      amount,
      balance: amount,
      senderEmail,
      senderName,
      recipientEmail,
      recipientName,
      message: message || "",
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      active: true,
    });
    return NextResponse.json({ id: docRef.id, code }, { status: 201 });
  } catch (err) {
    console.error("Failed to create gift card:", err);
    return NextResponse.json({ error: "Failed to create gift card" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
    }
    const q = query(collection(db, "giftCards"), where("code", "==", code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }
    const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to check gift card:", err);
    return NextResponse.json({ error: "Failed to check gift card" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, amount } = body;
    if (!code || !amount) {
      return NextResponse.json({ error: "Missing code or amount" }, { status: 400 });
    }
    const q = query(collection(db, "giftCards"), where("code", "==", code.toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    }
    const gc = snap.docs[0];
    const data = gc.data();
    if (!data.active) {
      return NextResponse.json({ error: "Gift card is inactive" }, { status: 400 });
    }
    if (data.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }
    const newBalance = data.balance - amount;
    await updateDoc(doc(db, "giftCards", gc.id), { balance: newBalance });
    return NextResponse.json({ success: true, remainingBalance: newBalance });
  } catch (err) {
    console.error("Failed to redeem gift card:", err);
    return NextResponse.json({ error: "Failed to redeem gift card" }, { status: 500 });
  }
}
