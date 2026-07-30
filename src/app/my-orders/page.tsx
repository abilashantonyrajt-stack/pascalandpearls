"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getOrdersByEmail, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { Package, LoaderCircle, X } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";

export default function MyOrdersPage() {
  const { isLoggedIn, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    getOrdersByEmail(user.email).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [user?.email]);

  async function handleCancel(orderId: string) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    try {
      const res = await fetch("/api/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email: user?.email }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, fulfillmentStatus: "cancelled", paymentStatus: "failed" } : o
          )
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to cancel");
      }
    } catch {
      alert("Failed to cancel order");
    }
    setCancelling(null);
  }

  function canCancel(order: Order): boolean {
    if (order.fulfillmentStatus !== "pending") return false;
    const createdAt = order.createdAt?.toMillis?.() || 0;
    return Date.now() - createdAt < 30 * 60 * 1000;
  }

  if (!isLoggedIn) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-mink text-sm mb-4">Sign in to view your orders.</p>
          <Link href="/auth" className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-light text-charcoal">My Orders</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><LoaderCircle size={24} className="animate-spin text-mink" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="mx-auto text-mink/30 mb-4" />
            <p className="text-mink text-sm mb-4">No orders yet.</p>
            <Link href="/shop" className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="glass-strong p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-mink">Order #{order.id?.slice(0, 8)}</p>
                    <p className="text-xs text-mink">{new Date(order.createdAt?.toMillis()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-[10px] tracking-widest uppercase px-3 py-1 ${order.paymentStatus === "completed" ? "bg-green-100 text-green-700" : order.paymentStatus === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{order.paymentStatus}</span>
                    {canCancel(order) && (
                      <button onClick={() => handleCancel(order.id!)} disabled={cancelling === order.id} className="flex items-center gap-1 text-[10px] tracking-widest uppercase px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                        {cancelling === order.id ? <LoaderCircle size={12} className="animate-spin" /> : <X size={12} />}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <Link href={`/order-confirmation?id=${order.id}`} className="block">
                  <div className="flex gap-2 mb-3">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="w-12 h-12 bg-ivory border border-stone overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-mink/30"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>'; }} />
                      </div>
                    ))}
                    {order.items.length > 4 && <div className="w-12 h-12 bg-ivory border border-stone flex items-center justify-center text-[10px] text-mink">+{order.items.length - 4}</div>}
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className={`inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 ${order.paymentMethod === "upi" ? "text-blue-600 bg-blue-50" : "text-emerald-600 bg-emerald-50"}`}>{order.paymentMethod === "upi" ? "UPI" : "COD"}</span>
                    <span className="text-charcoal font-medium">{formatPrice(order.totalAmount)}</span>
                  </div>
                </Link>
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="border-t border-stone/50 pt-4 mt-2">
                    <OrderTimeline history={order.statusHistory} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
