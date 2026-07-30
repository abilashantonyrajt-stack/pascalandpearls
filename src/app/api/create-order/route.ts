import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { createOrder } from "@/lib/orders";
import type { Order } from "@/lib/orders";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const now = Date.now();
    const order: Omit<Order, "id" | "createdAt"> = {
      customerDetails: body.customerDetails,
      items: body.items,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      paymentStatus: "pending",
      fulfillmentStatus: "pending",
      statusHistory: [{ status: "pending", timestamp: now, note: "Order placed" }],
      transactionId: body.transactionId,
      notes: body.notes,
      discountPercent: body.discountPercent,
      loyaltyPointsUsed: body.loyaltyPointsUsed,
      loyaltyDiscount: body.loyaltyDiscount,
      subtotal: body.subtotal,
      shipping: body.shipping,
    };

    if (
      !order.customerDetails?.name ||
      !order.customerDetails?.email ||
      !order.items?.length
    ) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    for (const item of order.items) {
      const productRef = doc(db, "products", item.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        await updateDoc(productRef, { stock: Math.max(0, currentStock - item.quantity) });
      }
    }

    const orderId = await createOrder(order);

    const email = order.customerDetails.email.toLowerCase().trim();

    if (order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0) {
      const loyaltyRef = doc(db, "loyalty", email);
      const loyaltySnap = await getDoc(loyaltyRef);
      const currentPoints = loyaltySnap.exists() ? loyaltySnap.data().points || 0 : 0;
      if (currentPoints >= order.loyaltyPointsUsed) {
        await updateDoc(loyaltyRef, { points: increment(-order.loyaltyPointsUsed) });
      }
    }

    const earnedPoints = Math.floor(order.totalAmount / 10);
    if (earnedPoints > 0) {
      const loyaltyRef = doc(db, "loyalty", email);
      const loyaltySnap = await getDoc(loyaltyRef);
      if (!loyaltySnap.exists()) {
        await setDoc(loyaltyRef, { points: earnedPoints, lifetimePoints: earnedPoints });
      } else {
        await updateDoc(loyaltyRef, { points: increment(earnedPoints), lifetimePoints: increment(earnedPoints) });
      }
    }

    const itemList = order.items.map((i) => `${i.name} x${i.quantity} — ₹${i.price * i.quantity}`).join("\n");
    const payInfo = order.paymentMethod === "upi" ? `UPI (Txn: ${order.transactionId})` : "Cash on Delivery";

    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: order.customerDetails.email,
      subject: `Order Confirmed — #${orderId.slice(0, 8)}`,
      html: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#faf8f5;border:1px solid #e5ddd3">
        <h1 style="font-size:18px;letter-spacing:0.2em;color:#3a3a3a;text-align:center;margin:0 0 24px">PASCAL & PEARLS</h1>
        <p style="font-size:13px;color:#8c7a6b;text-align:center;margin:0 0 20px">Thank you for your order!</p>
        <div style="background:#fff;border:1px solid #e5ddd3;padding:24px">
          <p style="font-size:11px;color:#8c7a6b;margin:0 0 4px">Order #${orderId.slice(0, 8)}</p>
          <p style="font-size:11px;color:#8c7a6b;margin:0 0 16px">Payment: ${payInfo}</p>
          ${order.items.map((i) => `<div style="display:flex;justify-content:space-between;font-size:13px;color:#3a3a3a;padding:8px 0;border-top:1px solid #f0ebe5">${i.name} x${i.quantity}<span style="color:#c4a882">₹${i.price * i.quantity}</span></div>`).join("")}
          ${order.discountPercent ? `<div style="display:flex;justify-content:space-between;font-size:12px;color:#8c7a6b;padding:8px 0;border-top:1px solid #f0ebe5">Discount (${order.discountPercent}%)<span style="color:#4ade80">-₹${((order.subtotal || 0) - (order.totalAmount || 0) + (order.shipping || 0))}</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;font-size:14px;color:#3a3a3a;padding:12px 0 0;border-top:1px solid #e5ddd3;margin-top:8px;font-weight:bold">Total<span style="color:#c4a882">₹${order.totalAmount}</span></div>
        </div>
        <div style="background:#fff;border:1px solid #e5ddd3;padding:16px;margin-top:12px;font-size:11px;color:#8c7a6b">
          <p style="margin:0 0 4px"><strong style="color:#3a3a3a">Shipping to:</strong></p>
          <p style="margin:0">${order.customerDetails.name}<br>${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} — ${order.customerDetails.pincode}</p>
        </div>
      </div>`,
    });

    const waPhone = order.customerDetails.phone?.replace(/\D/g, "") || "";
    const waMsg = `Hi ${order.customerDetails.name}! Your order #${orderId.slice(0, 8)} has been confirmed. Total: ₹${order.totalAmount}. Thank you for shopping at Pascal & Pearls!`;
    const waUrl = `https://wa.me/91${waPhone}?text=${encodeURIComponent(waMsg)}`;
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `New Order — #${orderId.slice(0, 8)} (${order.paymentMethod === "upi" ? "UPI" : "COD"})`,
      html: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#faf8f5;border:1px solid #e5ddd3">
        <h1 style="font-size:18px;letter-spacing:0.2em;color:#3a3a3a;text-align:center;margin:0 0 24px">New Order Received</h1>
        <div style="background:#fff;border:1px solid #e5ddd3;padding:24px;margin-bottom:12px">
          <p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Order:</strong> #${orderId.slice(0, 8)}</p>
          <p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Customer:</strong> ${order.customerDetails.name}</p>
          <p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Phone:</strong> ${order.customerDetails.phone}</p>
          <p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Email:</strong> ${order.customerDetails.email}</p>
          <p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Payment:</strong> ${payInfo}</p>
          <p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Total:</strong> ₹${order.totalAmount}</p>
          <p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Address:</strong> ${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} — ${order.customerDetails.pincode}</p>
          ${order.notes ? `<p style="font-size:13px;color:#3a3a3a;margin:0 0 8px"><strong>Notes:</strong> ${order.notes}</p>` : ""}
        </div>
        <div style="background:#fff;border:1px solid #e5ddd3;padding:16px;margin-bottom:12px">
          <p style="font-size:11px;color:#8c7a6b;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em">Items</p>
          ${order.items.map((i) => `<div style="display:flex;justify-content:space-between;font-size:13px;color:#3a3a3a;padding:6px 0;border-top:1px solid #f0ebe5">${i.name} x${i.quantity}<span>₹${i.price * i.quantity}</span></div>`).join("")}
        </div>
        <a href="${waUrl}" style="display:block;text-align:center;background:#25D366;color:#fff;text-decoration:none;padding:12px 24px;font-size:13px;letter-spacing:0.1em;border-radius:4px">Send WhatsApp to Customer</a>
      </div>`,
    });

    return NextResponse.json({ orderId, success: true });
  } catch (err: any) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
