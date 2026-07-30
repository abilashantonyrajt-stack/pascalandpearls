import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, description, images, category, stock, featured, material, variants } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Missing required fields (name, price, category)" }, { status: 400 });
    }

    const ref = await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      description: description || "",
      images: images?.length ? images : [],
      category,
      stock: stock != null ? Number(stock) : 10,
      featured: !!featured,
      material: material || "",
      variants: variants?.length ? variants : [],
      createdAt: Date.now(),
    });

    return NextResponse.json({ id: ref.id, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (fields.name !== undefined) updateData.name = fields.name;
    if (fields.price !== undefined) updateData.price = Number(fields.price);
    if (fields.description !== undefined) updateData.description = fields.description;
    if (fields.images !== undefined) updateData.images = fields.images;
    if (fields.category !== undefined) updateData.category = fields.category;
    if (fields.stock !== undefined) updateData.stock = Number(fields.stock);
    if (fields.featured !== undefined) updateData.featured = !!fields.featured;
    if (fields.material !== undefined) updateData.material = fields.material;
    if (fields.variants !== undefined) updateData.variants = fields.variants;

    await updateDoc(ref, updateData);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await deleteDoc(ref);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
