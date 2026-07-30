"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface SiteContentMap {
  [key: string]: any;
}

const SiteContentContext = createContext<SiteContentMap>({});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContentMap>({});

  useEffect(() => {
    getDocs(collection(db, "siteContent")).then((snap) => {
      const map: SiteContentMap = {};
      snap.docs.forEach((d) => { map[d.id] = d.data(); });
      setContent(map);
    }).catch(() => {});
  }, []);

  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
