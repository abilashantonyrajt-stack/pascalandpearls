import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { action, name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const usersRef = collection(db, "users");
    const existingQuery = query(usersRef, where("email", "==", email));
    const existing = await getDocs(existingQuery);

    if (action === "register") {
      if (!name) {
        return NextResponse.json({ error: "Missing name" }, { status: 400 });
      }
      if (!existing.empty) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
      await addDoc(usersRef, {
        name,
        email,
        password,
        accountType: "password",
        createdAt: Timestamp.now(),
      });
      return NextResponse.json({ success: true, name, email });
    }

    if (action === "login") {
      if (existing.empty) {
        return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
      }
      const userData = existing.docs[0].data();
      if (userData.password !== password) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
      }
      return NextResponse.json({ success: true, name: userData.name, email });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("auth error:", err);
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}
