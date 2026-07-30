import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { verifyAdminRequest } from "@/lib/admin-check";

export async function GET(req: Request) {
  try {
    const { authorized } = verifyAdminRequest(req);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
