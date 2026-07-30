import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { verifyAdminRequest } from "@/lib/admin-check";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function PATCH(req: Request) {
  try {
    const { authorized } = verifyAdminRequest(req);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { orderId, paymentStatus, fulfillmentStatus, trackingNumber } = await req.json();

    if (!orderId || (!paymentStatus && !fulfillmentStatus && trackingNumber === undefined)) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data = snap.data();
    const updateData: Record<string, any> = {};
    const now = Date.now();
    const newHistory: any[] = [];

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      newHistory.push({ status: `payment:${paymentStatus}`, timestamp: now, note: `Payment ${paymentStatus}` });
    }
    if (fulfillmentStatus) {
      updateData.fulfillmentStatus = fulfillmentStatus;
      const notes: Record<string, string> = { shipped: "Order shipped", delivered: "Order delivered", cancelled: "Order cancelled" };
      newHistory.push({ status: fulfillmentStatus, timestamp: now, note: notes[fulfillmentStatus] || fulfillmentStatus });
    }
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    if (newHistory.length > 0) {
      const existing = data.statusHistory || [];
      updateData.statusHistory = [...existing, ...newHistory];
    }

    await updateDoc(ref, updateData);
    const email = data.customerDetails?.email;
    const orderIdShort = orderId.slice(0, 8);
    const trackingStr = (data.trackingNumber || trackingNumber || "").trim();

    if (paymentStatus && paymentStatus !== data.paymentStatus) {
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: `Order #${orderIdShort} — Payment ${paymentStatus.toUpperCase()}`,
        html: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#faf8f5">
          <h1 style="font-size:18px;letter-spacing:0.2em;color:#3a3a3a;text-align:center">PASCAL & PEARLS</h1>
          <p style="font-size:13px;color:#8c7a6b;text-align:center">Payment status: <strong>${paymentStatus.toUpperCase()}</strong></p>
          <p style="font-size:11px;color:#8c7a6b;text-align:center">Order #${orderIdShort}</p>
        </div>`,
      });
    }

    if (fulfillmentStatus && fulfillmentStatus !== data.fulfillmentStatus) {
      const statusLabels: Record<string, string> = {
        pending: "Order placed",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };
      const subject = `Order #${orderIdShort} — ${statusLabels[fulfillmentStatus] || fulfillmentStatus}`;
      let message = fulfillmentStatus === "shipped"
        ? "Your order is on its way! You'll receive it within 3-5 business days."
        : fulfillmentStatus === "delivered"
        ? "Your order has been delivered. We hope you love it!"
        : fulfillmentStatus === "cancelled"
        ? "Your order has been cancelled."
        : `Your order status has been updated to ${fulfillmentStatus}.`;

      let trackingHtml = "";
      if (fulfillmentStatus === "shipped" && trackingStr) {
        message += ` Tracking number: ${trackingStr}.`;
        trackingHtml = `<p style="font-size:13px;color:#8c7a6b;text-align:center">Tracking: <strong>${trackingStr}</strong></p>`;
      }

      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        html: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#faf8f5">
          <h1 style="font-size:18px;letter-spacing:0.2em;color:#3a3a3a;text-align:center">PASCAL & PEARLS</h1>
          <p style="font-size:16px;color:#3a3a3a;text-align:center;margin:16px 0"><strong>${statusLabels[fulfillmentStatus] || fulfillmentStatus}</strong></p>
          <p style="font-size:13px;color:#8c7a6b;text-align:center">${message}</p>
          ${trackingHtml}
          <p style="font-size:11px;color:#8c7a6b;text-align:center">Order #${orderIdShort}</p>
        </div>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("update-order-status error:", err);
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 500 });
  }
}
