import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, deleteDoc } from "firebase/firestore";

const rateLimit = new Map<string, number>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const lastSent = rateLimit.get(email);
    if (lastSent && Date.now() - lastSent < 60000) {
      const wait = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
      return NextResponse.json({ error: `Please wait ${wait}s before requesting another OTP` }, { status: 429 });
    }

    const otp = generateOtp();

    const otpsRef = collection(db, "otps");
    const existingQuery = query(otpsRef, where("email", "==", email));
    const existing = await getDocs(existingQuery);
    const deletePromises = existing.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    await addDoc(otpsRef, {
      email,
      code: otp,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 5 * 60 * 1000),
    });

    rateLimit.set(email, Date.now());

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP for Pascal & Pearls",
      text: `Your OTP is: ${otp}\n\nThis code expires in 5 minutes.\n\n- Pascal & Pearls`,
      html: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;padding:32px;background:#faf8f5;border:1px solid #e5ddd3">
        <h1 style="font-size:18px;letter-spacing:0.2em;color:#3a3a3a;text-align:center;margin:0 0 24px">PASCAL & PEARLS</h1>
        <p style="font-size:13px;color:#8c7a6b;text-align:center;margin:0 0 20px">Your one-time verification code</p>
        <div style="background:#fff;border:1px solid #e5ddd3;padding:24px;text-align:center">
          <div style="font-size:36px;letter-spacing:0.3em;color:#3a3a3a;font-weight:bold;margin:12px 0">${otp}</div>
          <p style="font-size:11px;color:#8c7a6b;margin:16px 0 0">This code expires in 5 minutes.</p>
        </div>
        <p style="font-size:11px;color:#8c7a6b;text-align:center;margin:24px 0 0">If you didn't request this, please ignore this email.</p>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("send-otp error:", err);
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
