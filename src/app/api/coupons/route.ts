import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { verifyAdminRequest } from "@/lib/admin-check";

export async function POST(req: Request) {
  try {
    const { authorized } = verifyAdminRequest(req);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { code, discountPercent, expiresAt } = await req.json();

    if (!code || discountPercent == null) {
      return NextResponse.json({ error: "Missing code or discountPercent" }, { status: 400 });
    }

    const existing = await getDocs(query(collection(db, "coupons"), where("code", "==", code.toUpperCase())));
    if (!existing.empty) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }

    const ref = await addDoc(collection(db, "coupons"), {
      code: code.toUpperCase(),
      discountPercent: Number(discountPercent),
      expiresAt: expiresAt ? Timestamp.fromDate(new Date(expiresAt)) : null,
      createdAt: Timestamp.now(),
      usedCount: 0,
    });

    return NextResponse.json({ id: ref.id, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const snap = await getDocs(query(collection(db, "coupons"), where("code", "==", code.toUpperCase())));
  if (snap.empty) {
    return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  }

  const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;

  if (coupon.expiresAt?.toMillis() < Date.now()) {
    return NextResponse.json({ error: "Coupon has expired" }, { status: 410 });
  }

  return NextResponse.json({ code: coupon.code, discountPercent: coupon.discountPercent });
}
