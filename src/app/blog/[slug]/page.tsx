"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { LoaderCircle, ArrowLeft } from "lucide-react";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "blog"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          setPost({ id: d.id, ...d.data() } as BlogPost);
        }
      } catch (e) {
        console.error("Failed to load blog post:", e);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center"><LoaderCircle size={24} className="animate-spin text-mink" /></div>
    );
  }

  if (!post) {
    return (
      <div className="bg-ivory min-h-screen flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-sm text-mink">Post not found.</p>
        <Link href="/blog" className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors mb-8">
          <ArrowLeft size={12} /> Back to Blog
        </Link>
        <div className="glass-card overflow-hidden">
          {post.image && (
            <div className="aspect-[21/9] overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 text-xs text-mink mb-4">
              <span>{post.createdAt ? new Date(post.createdAt.toMillis()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}</span>
              <span className="w-1 h-1 rounded-full bg-mink/40" />
              <span>By {post.author}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-light text-charcoal tracking-widest uppercase mb-6">{post.title}</h1>
            <div
              className="prose prose-sm max-w-none text-charcoal leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-stone/50">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] tracking-widest uppercase px-3 py-1 bg-charcoal/5 text-mink">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
