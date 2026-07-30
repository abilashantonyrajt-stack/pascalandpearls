"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Bell, BellRing } from "lucide-react";

export default function PushNotify() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    setSubscribed(true);
    const q = query(collection(db, "adminAlerts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(data.title || "Admin Alert", {
              body: data.body || "",
              icon: "/favicon.ico",
            });
          }
        }
      });
    });
    return () => unsub();
  }, [permission]);

  async function requestPermission() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  if (permission === "denied") {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell size={20} className="text-mink" />
          <span className="text-xs tracking-widest uppercase text-charcoal">Push Notifications</span>
        </div>
        <p className="text-xs text-red-500">Notifications blocked. Enable in browser settings.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-3">
        {subscribed ? <BellRing size={20} className="text-green-600" /> : <Bell size={20} className="text-mink" />}
        <span className="text-xs tracking-widest uppercase text-charcoal">Push Notifications</span>
      </div>
      {subscribed ? (
        <div>
          <p className="text-xs text-green-700 mb-3">Notifications enabled — listening for alerts.</p>
          <button
            onClick={async () => {
              await fetch("/api/admin/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Test Alert", body: "This is a test notification from your admin panel." }),
              });
            }}
            className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors"
          >
            Send Test Notification
          </button>
        </div>
      ) : (
        <button
          onClick={requestPermission}
          className="flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors"
        >
          <Bell size={14} /> Enable Notifications
        </button>
      )}
    </div>
  );
}
