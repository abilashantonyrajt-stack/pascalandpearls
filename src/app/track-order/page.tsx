"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useI18n } from "@/i18n/LanguageProvider";
import OrderTimeline from "@/components/OrderTimeline";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/orders";

export default function TrackOrderPage() {
  const { t } = useI18n();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    setLoading(true);
    setSearched(false);
    setOrder(null);
    try {
      const q = query(collection(db, "orders"), where("customerDetails.email", "==", email.trim()));
      const snap = await getDocs(q);
      const doc = snap.docs.find((d) => d.id === orderId.trim());
      setOrder(doc ? ({ id: doc.id, ...doc.data() } as Order) : null);
    } catch {
      setOrder(null);
    }
    setLoading(false);
    setSearched(true);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-light text-charcoal">{t("order.title")}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="glass-strong p-6 space-y-4 mb-8">
          <div>
            <label className="block text-xs tracking-widest uppercase text-mink mb-2">{t("order.id")}</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-mink mb-2">{t("order.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse">{t("common.loading")}</span>
            ) : (
              <>
                <Search size={14} /> {t("order.lookup")}
              </>
            )}
          </button>
        </form>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-mink/30 border-t-mink rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && !order && (
          <div className="text-center py-12">
            <Package size={40} className="mx-auto text-mink/30 mb-4" />
            <p className="text-sm text-mink">{t("order.notFound")}</p>
          </div>
        )}

        {!loading && order && (
          <div className="glass-strong p-6">
            <p className="text-xs text-mink mb-4">
              {t("order.id")}: #{order.id?.slice(0, 8)}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`text-[10px] tracking-widest uppercase px-3 py-1 ${
                  statusColors[order.fulfillmentStatus] || "bg-stone/50 text-mink"
                }`}
              >
                {t("order.fulfillment")}: {order.fulfillmentStatus}
              </span>
              <span
                className={`text-[10px] tracking-widest uppercase px-3 py-1 ${
                  statusColors[order.paymentStatus] || "bg-stone/50 text-mink"
                }`}
              >
                {t("order.payment")}: {order.paymentStatus}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-xs tracking-widest uppercase text-mink">{t("order.items")}</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ivory border border-stone overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 text-sm text-charcoal">
                    {item.name}
                    {item.variant && <span className="text-mink text-xs ml-1">({item.variant})</span>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-[10px] text-mink">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone pt-4 flex justify-between text-sm font-medium mb-6">
              <span className="text-charcoal">{t("order.total")}</span>
              <span className="text-charcoal">{formatPrice(order.totalAmount)}</span>
            </div>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="border-t border-stone pt-4">
                <OrderTimeline history={order.statusHistory} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
