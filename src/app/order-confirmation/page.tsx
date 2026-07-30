"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";
import { getOrder } from "@/lib/orders";
import type { Order } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

function OrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    getOrder(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="text-center px-4">
        <Package size={48} className="mx-auto text-mink/50 mb-4" />
        <h1 className="text-xl font-light text-charcoal mb-2">No order to display</h1>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors mt-4"
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-cream-dark rounded-full mx-auto mb-4" />
        <div className="h-4 bg-cream-dark w-48 mx-auto mb-2" />
        <div className="h-3 bg-cream-dark w-32 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center px-4">
        <p className="text-mink text-sm mb-4">Order not found.</p>
        <Link
          href="/shop"
          className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-light text-charcoal mb-2">
        Order Confirmed!
      </h1>
      <p className="text-sm text-mink mb-2">
        Thank you for your purchase, {order.customerDetails.name}.
      </p>
      <p className="text-xs text-mink/60 mb-8">Order ID: {order.id}</p>

      <div className="glass-strong p-6 text-left mb-8">
        <h3 className="text-xs tracking-widest uppercase text-charcoal mb-4">
          Order Summary
        </h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-charcoal">
                {item.name} <span className="text-mink">x{item.quantity}</span>
              </span>
              <span className="text-charcoal">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-stone mt-4 pt-4 flex justify-between text-sm font-medium">
          <span className="text-charcoal">Total</span>
          <span className="text-charcoal">{formatPrice(order.totalAmount)}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-stone">
          <p className="text-xs tracking-widest uppercase text-mink mb-2">
            Shipping To
          </p>
          <p className="text-sm text-charcoal">
            {order.customerDetails.address}, {order.customerDetails.city},{" "}
            {order.customerDetails.state} - {order.customerDetails.pincode}
          </p>
        </div>
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-stone">
            <OrderTimeline history={order.statusHistory} />
          </div>
        )}
        <div className="mt-4">
          <span
            className={`inline-block text-xs tracking-widest uppercase px-3 py-1 ${
              order.paymentStatus === "completed"
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            Payment: {order.paymentStatus}
          </span>
          <span className="inline-block text-xs tracking-widest uppercase px-3 py-1 bg-cream-dark text-mink ml-2">
            {order.paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-8 py-4 hover:bg-charcoal-deep transition-colors"
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
        <button onClick={() => window.print()} className="text-xs tracking-widest uppercase border border-charcoal text-charcoal px-8 py-4 hover:bg-charcoal hover:text-ivory transition-colors">
          Print Invoice
        </button>
      </div>

      <style jsx>{`
        @media print {
          nav, footer, button { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="bg-ivory min-h-screen flex items-center justify-center">
      <Suspense
        fallback={
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-cream-dark rounded-full mx-auto mb-4" />
            <div className="h-4 bg-cream-dark w-48 mx-auto" />
          </div>
        }
      >
        <OrderContent />
      </Suspense>
    </div>
  );
}
