"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { LoaderCircle, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "blog"), where("published", "==", true), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BlogPost));
      } catch (e) {
        console.error("Failed to load blog posts:", e);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl font-light text-charcoal tracking-widest uppercase mb-2 text-center">Blog</h1>
        <p className="text-sm text-mink text-center mb-12">Stories, style notes &amp; inspiration</p>
        {loading ? (
          <div className="flex justify-center py-20"><LoaderCircle size={24} className="animate-spin text-mink" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-mink text-sm">No posts yet. Come back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="glass-card overflow-hidden flex flex-col h-full">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] tracking-widest uppercase text-mink mb-2">{post.createdAt ? new Date(post.createdAt.toMillis()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
                    <h2 className="text-sm tracking-widest uppercase text-charcoal mb-2 group-hover:text-mink transition-colors">{post.title}</h2>
                    <p className="text-xs text-mink leading-relaxed flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-charcoal mt-4 group-hover:text-mink transition-colors">
                      Read More <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
