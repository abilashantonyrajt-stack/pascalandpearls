"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Upload, FileText, CheckCircle, AlertCircle, LoaderCircle } from "lucide-react";

interface PreviewProduct {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  material: string;
  image_url: string;
}

export default function BulkImportTab() {
  const [preview, setPreview] = useState<PreviewProduct[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  function parseCSV(text: string): PreviewProduct[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);

    const nameIdx = idx("name");
    const priceIdx = idx("price");
    const descIdx = idx("description");
    const catIdx = idx("category");
    const stockIdx = idx("stock");
    const matIdx = idx("material");
    const imgIdx = idx("image_url");

    const results: PreviewProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 2) continue;
      const name = nameIdx >= 0 ? cols[nameIdx] : "";
      if (!name) continue;
      results.push({
        name,
        price: priceIdx >= 0 ? parseFloat(cols[priceIdx]) || 0 : 0,
        description: descIdx >= 0 ? cols[descIdx] : "",
        category: catIdx >= 0 ? cols[catIdx] : "",
        stock: stockIdx >= 0 ? parseInt(cols[stockIdx]) || 0 : 0,
        material: matIdx >= 0 ? cols[matIdx] : "",
        image_url: imgIdx >= 0 ? cols[imgIdx] : "",
      });
    }

    return results;
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setPreview(parseCSV(text));
      setDone(0);
      setErrors([]);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleImport() {
    setImporting(true);
    setErrors([]);
    let count = 0;
    const errs: string[] = [];

    for (const p of preview) {
      try {
        await addDoc(collection(db, "products"), {
          name: p.name,
          price: p.price,
          description: p.description,
          category: p.category || "uncategorized",
          stock: p.stock,
          material: p.material,
          images: p.image_url ? [p.image_url] : [],
          featured: false,
          createdAt: Date.now(),
        });
        count++;
      } catch (e: any) {
        errs.push(`${p.name}: ${e.message}`);
      }
    }

    setDone(count);
    setErrors(errs);
    setImporting(false);
  }

  return (
    <div>
      <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Bulk CSV Import</h2>

      <div className="glass-card p-6 mb-6 max-w-2xl">
        <label className="flex items-center gap-3 text-xs tracking-widest uppercase cursor-pointer bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors w-fit">
          <Upload size={14} /> Choose CSV File
          <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
        </label>
        <p className="text-[11px] text-mink mt-3">
          Expected columns: name, price, description, category, stock, material, image_url
        </p>
      </div>

      {preview.length > 0 && (
        <div className="glass-card p-6 mb-6 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs tracking-widest uppercase text-charcoal">
              Preview ({preview.length} products)
            </h3>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-50"
            >
              {importing ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              {importing ? "Importing..." : "Import All"}
            </button>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs tracking-widest uppercase text-mink border-b border-stone">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Price</th>
                  <th className="text-left py-3 px-2">Category</th>
                  <th className="text-left py-3 px-2">Stock</th>
                  <th className="text-left py-3 px-2">Material</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr key={i} className="border-b border-stone/50 hover:bg-white/20 transition-colors">
                    <td className="py-3 px-2 text-charcoal">{p.name}</td>
                    <td className="py-3 px-2 text-charcoal">₹{p.price}</td>
                    <td className="py-3 px-2 text-xs text-mink">{p.category || "-"}</td>
                    <td className="py-3 px-2 text-charcoal">{p.stock}</td>
                    <td className="py-3 px-2 text-mink text-xs">{p.material || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {done > 0 && (
        <div className="glass-card p-4 max-w-2xl flex items-center gap-3 text-sm text-green-700">
          <CheckCircle size={18} /> Successfully imported {done} product{done > 1 ? "s" : ""}.
        </div>
      )}

      {errors.length > 0 && (
        <div className="glass-card p-4 max-w-2xl mt-4">
          <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
            <AlertCircle size={16} /> {errors.length} error{errors.length > 1 ? "s" : ""}
          </div>
          <ul className="text-xs text-mink space-y-1">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
