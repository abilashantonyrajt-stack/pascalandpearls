import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const ref = doc(db, "loyalty", email.toLowerCase().trim());
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ points: 0, lifetimePoints: 0 });
    }
    return NextResponse.json(snap.data());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailKey = email.toLowerCase().trim();
    const ref = doc(db, "loyalty", emailKey);

    if (action === "earn") {
      const points = body.points || 0;
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { points, lifetimePoints: points });
      } else {
        await updateDoc(ref, {
          points: increment(points),
          lifetimePoints: increment(points),
        });
      }
      return NextResponse.json({ success: true, earned: points });
    }

    if (action === "redeem") {
      const points = body.points || 0;
      const snap = await getDoc(ref);
      const currentPoints = snap.exists() ? snap.data().points || 0 : 0;
      if (currentPoints < points) {
        return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
      }
      await updateDoc(ref, { points: increment(-points) });
      return NextResponse.json({ success: true, redeemed: points });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
