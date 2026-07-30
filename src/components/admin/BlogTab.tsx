"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { LoaderCircle, Plus, Edit2, Trash2, Search, X, CheckCircle } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    author: "",
    tags: "",
    published: false,
  });

  function resetForm() {
    setForm({ title: "", slug: "", excerpt: "", content: "", image: "", author: "", tags: "", published: false });
    setEditing(null);
    setShowForm(false);
  }

  function openEdit(post: BlogPost) {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      author: post.author,
      tags: post.tags.join(", "),
      published: post.published,
    });
    setEditing(post);
    setShowForm(true);
  }

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "blog"));
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BlogPost));
    } catch (e) {
      console.error("Failed to load blog posts:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) return;
    setSaving(true);
    const data: any = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image,
      author: form.author,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      published: form.published,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "blog", editing.id!), data);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "blog"), data);
      }
      resetForm();
      fetchPosts();
    } catch (e) {
      console.error("Failed to save blog post:", e);
    }
    setSaving(false);
  }

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "blog", postId));
      fetchPosts();
    } catch (e) {
      console.error("Failed to delete blog post:", e);
    }
  }

  const filtered = posts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  if (loading) return <div className="flex justify-center py-20"><LoaderCircle size={24} className="animate-spin text-mink" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm tracking-widest uppercase text-charcoal">Blog Posts ({posts.length})</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mink" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="glass-input pl-9 pr-4 py-2 text-xs text-charcoal focus:outline-none w-48" />
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors"><Plus size={14} /> New Post</button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs tracking-widest uppercase text-charcoal">{editing ? "Edit Post" : "New Post"}</h3>
            <button onClick={resetForm} className="text-mink hover:text-charcoal"><X size={16} /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none font-mono text-xs" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Content * (HTML)</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none resize-none font-mono text-xs" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Image URL</label>
              <div className="flex gap-2">
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="flex-1 glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
                {form.image && <img src={form.image} alt="" className="w-10 h-10 object-cover rounded border border-stone shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
              </div>
            </div>
            <div>
              <label className="text-xs tracking-wider text-mink mb-1 block">Author</label>
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
            </div>
            <div>
              <label className="text-xs tracking-wider text-mink mb-1 block">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="style, jewelry, tips" className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-charcoal" />
                <span className="text-xs tracking-widest uppercase text-mink">Published</span>
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-50">{saving ? "Saving..." : editing ? "Update Post" : "Create Post"}</button>
              <button type="button" onClick={resetForm} className="text-xs tracking-widest uppercase border border-stone text-mink px-6 py-3 hover:bg-stone/30 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-mink text-sm">No posts found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs tracking-widest uppercase text-mink border-b border-stone"><th className="text-left py-3 px-2">Title</th><th className="text-left py-3 px-2">Slug</th><th className="text-left py-3 px-2">Status</th><th className="text-left py-3 px-2">Date</th><th className="text-left py-3 px-2">Actions</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-stone/50 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => openEdit(p)}>
                  <td className="py-3 px-2 text-charcoal font-medium">{p.title}</td>
                  <td className="py-3 px-2 text-mink text-xs font-mono">{p.slug}</td>
                  <td className="py-3 px-2">{p.published ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5">Published</span> : <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5">Draft</span>}</td>
                  <td className="py-3 px-2 text-mink text-xs">{p.createdAt ? new Date((p.createdAt as Timestamp).toMillis()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                  <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-mink hover:text-charcoal transition-colors" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id!)} className="p-1.5 text-mink hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
