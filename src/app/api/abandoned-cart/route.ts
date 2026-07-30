import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const ref = doc(db, "carts", email);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ sent: false, reason: "no_cart" });
    }

    const data = snap.data();
    const items = data.items || [];
    if (items.length === 0) {
      return NextResponse.json({ sent: false, reason: "empty_cart" });
    }

    const updatedAt = data.updatedAt || 0;
    const threeHours = 3 * 60 * 60 * 1000;
    if (Date.now() - updatedAt < threeHours) {
      return NextResponse.json({ sent: false, reason: "too_soon" });
    }

    const lastReminded = data.lastRemindedAt || 0;
    const oneDay = 24 * 60 * 60 * 1000;
    if (lastReminded && Date.now() - lastReminded < oneDay) {
      return NextResponse.json({ sent: false, reason: "already_reminded" });
    }

    const itemList = items.map((i: any) => `${i.name} x${i.quantity} — ₹${i.price * i.quantity}`).join("\n");
    const total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Complete Your Order — Pascal & Pearls",
      html: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#faf8f5;border:1px solid #e5ddd3">
        <h1 style="font-size:18px;letter-spacing:0.2em;color:#3a3a3a;text-align:center;margin:0 0 24px">PASCAL & PEARLS</h1>
        <p style="font-size:14px;color:#3a3a3a;text-align:center;margin:0 0 16px">You left something behind!</p>
        <p style="font-size:12px;color:#8c7a6b;text-align:center;margin:0 0 20px">Your cart is still waiting. Complete your order now.</p>
        <div style="background:#fff;border:1px solid #e5ddd3;padding:16px;margin-bottom:16px">
          ${items.map((i: any) => `<div style="display:flex;justify-content:space-between;font-size:13px;color:#3a3a3a;padding:8px 0;border-top:1px solid #f0ebe5">${i.name} x${i.quantity}<span style="color:#c4a882">₹${i.price * i.quantity}</span></div>`).join("")}
          <div style="display:flex;justify-content:space-between;font-size:14px;color:#3a3a3a;padding:12px 0 0;border-top:1px solid #e5ddd3;margin-top:8px;font-weight:bold">Total<span style="color:#c4a882">₹${total}</span></div>
        </div>
        <a href="https://pascal-and-pearls.vercel.app/checkout" style="display:block;text-align:center;background:#3a3a3a;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;padding:14px;margin-top:16px">Complete Order</a>
      </div>`,
    });

    const { setDoc } = await import("firebase/firestore");
    await setDoc(ref, { lastRemindedAt: Date.now() }, { merge: true });

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("Abandoned cart error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
