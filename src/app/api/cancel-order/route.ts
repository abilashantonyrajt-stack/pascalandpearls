import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function POST(req: Request) {
  try {
    const { orderId, email } = await req.json();
    if (!orderId || !email) {
      return NextResponse.json({ error: "Missing orderId or email" }, { status: 400 });
    }

    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data = snap.data();
    if (data.customerDetails?.email !== email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const createdAt = data.createdAt?.toMillis?.() || 0;
    const thirtyMinutes = 30 * 60 * 1000;
    if (Date.now() - createdAt > thirtyMinutes) {
      return NextResponse.json({ error: "Cancellation window expired (30 minutes)" }, { status: 400 });
    }
    if (data.fulfillmentStatus !== "pending") {
      return NextResponse.json({ error: "Order already processed, cannot cancel" }, { status: 400 });
    }

    const history = data.statusHistory || [];
    history.push({ status: "cancelled", timestamp: Date.now(), note: "Cancelled by customer" });

    await updateDoc(ref, {
      fulfillmentStatus: "cancelled",
      paymentStatus: "failed",
      statusHistory: history,
    });

    for (const item of data.items || []) {
      const productRef = doc(db, "products", item.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        await updateDoc(productRef, { stock: currentStock + item.quantity });
      }
    }

    const orderIdShort = orderId.slice(0, 8);
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Order #${orderIdShort} — Cancelled`,
      html: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#faf8f5">
        <h1 style="font-size:18px;letter-spacing:0.2em;color:#3a3a3a;text-align:center">PASCAL & PEARLS</h1>
        <p style="font-size:13px;color:#8c7a6b;text-align:center">Your order #${orderIdShort} has been cancelled.</p>
        <p style="font-size:11px;color:#8c7a6b;text-align:center">If you paid via UPI, please allow 3-5 business days for the refund to reflect.</p>
      </div>`,
    }).catch(() => {});

    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `Order Cancelled by Customer — #${orderIdShort}`,
      text: `Order #${orderIdShort} was cancelled by ${data.customerDetails?.name} (${email}). Stock has been restored.`,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Cancel order error:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel" }, { status: 500 });
  }
}
