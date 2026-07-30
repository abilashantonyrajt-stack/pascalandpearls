"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import type { Order } from "@/lib/orders";
import type { Product } from "@/lib/products";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";

export default function AnalyticsTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ordersSnap, productsSnap] = await Promise.all([
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "products")),
      ]);
      setOrders(ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
      setProducts(productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const orderDate = (o: Order) => (o.createdAt?.toMillis ? new Date(o.createdAt.toMillis()) : null);

  const isToday = (o: Order) => { const d = orderDate(o); return d && d >= todayStart; };
  const isThisWeek = (o: Order) => { const d = orderDate(o); return d && d >= weekStart; };
  const isThisMonth = (o: Order) => { const d = orderDate(o); return d && d >= monthStart; };

  const ordersToday = orders.filter(isToday);
  const ordersThisWeek = orders.filter(isThisWeek);
  const ordersThisMonth = orders.filter(isThisMonth);

  const revenueToday = ordersToday.reduce((s, o) => s + o.totalAmount, 0);
  const revenueThisWeek = ordersThisWeek.reduce((s, o) => s + o.totalAmount, 0);
  const revenueThisMonth = ordersThisMonth.reduce((s, o) => s + o.totalAmount, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const productSales: Record<string, { name: string; quantity: number; total: number }> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      if (!productSales[item.productId]) productSales[item.productId] = { name: item.name, quantity: 0, total: 0 };
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].total += item.price * item.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const revenueByMethod: Record<string, number> = {};
  orders.forEach((o) => {
    const method = o.paymentMethod === "upi" ? "UPI" : "COD";
    revenueByMethod[method] = (revenueByMethod[method] || 0) + o.totalAmount;
  });

  const dailyRevenue: { date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d);
    const dayEnd = new Date(d);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const revenue = orders
      .filter((o) => {
        const od = orderDate(o);
        return od && od >= dayStart && od < dayEnd;
      })
      .reduce((s, o) => s + o.totalAmount, 0);
    dailyRevenue.push({
      date: dayStart.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      revenue,
    });
  }

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1);

  const lowStock = products.filter((p) => p.stock <= 3 && p.stock > 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-charcoal border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign size={20} className="text-mink" />
            <span className="text-xs tracking-widest uppercase text-mink">Revenue</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm flex justify-between"><span className="text-mink">Today</span><span className="text-charcoal">₹{revenueToday.toLocaleString()}</span></p>
            <p className="text-sm flex justify-between"><span className="text-mink">This Week</span><span className="text-charcoal">₹{revenueThisWeek.toLocaleString()}</span></p>
            <p className="text-sm flex justify-between"><span className="text-mink">This Month</span><span className="text-charcoal">₹{revenueThisMonth.toLocaleString()}</span></p>
            <p className="text-sm flex justify-between font-medium"><span className="text-mink">All Time</span><span className="text-charcoal">₹{totalRevenue.toLocaleString()}</span></p>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag size={20} className="text-mink" />
            <span className="text-xs tracking-widest uppercase text-mink">Orders</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm flex justify-between"><span className="text-mink">Today</span><span className="text-charcoal">{ordersToday.length}</span></p>
            <p className="text-sm flex justify-between"><span className="text-mink">This Week</span><span className="text-charcoal">{ordersThisWeek.length}</span></p>
            <p className="text-sm flex justify-between"><span className="text-mink">This Month</span><span className="text-charcoal">{ordersThisMonth.length}</span></p>
            <p className="text-sm flex justify-between font-medium"><span className="text-mink">All Time</span><span className="text-charcoal">{orders.length}</span></p>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={20} className="text-mink" />
            <span className="text-xs tracking-widest uppercase text-mink">Average</span>
          </div>
          <p className="text-2xl font-light text-charcoal">₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-mink mt-1">Avg order value</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users size={20} className="text-mink" />
            <span className="text-xs tracking-widest uppercase text-mink">Payment</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm flex justify-between"><span className="text-mink">UPI</span><span className="text-charcoal">₹{(revenueByMethod.UPI || 0).toLocaleString()}</span></p>
            <p className="text-sm flex justify-between"><span className="text-mink">COD</span><span className="text-charcoal">₹{(revenueByMethod.COD || 0).toLocaleString()}</span></p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Daily Revenue (Last 7 Days)</h2>
        <div className="glass-card p-6">
          <div className="flex items-end justify-between gap-2" style={{ height: "10rem" }}>
            {dailyRevenue.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] text-charcoal font-medium">₹{d.revenue}</span>
                <div
                  className="w-full bg-charcoal/20 rounded-t transition-all"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? "4px" : "0" }}
                />
                <span className="text-[10px] text-mink whitespace-nowrap">{d.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Top Selling Products</h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs tracking-widest uppercase text-mink border-b border-stone">
                <th className="text-left py-3 px-2">#</th>
                <th className="text-left py-3 px-2">Product</th>
                <th className="text-left py-3 px-2">Qty Sold</th>
                <th className="text-left py-3 px-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.id} className="border-b border-stone/50 hover:bg-white/20 transition-colors">
                  <td className="py-3 px-2 text-mink text-xs">{i + 1}</td>
                  <td className="py-3 px-2 text-charcoal">{p.name}</td>
                  <td className="py-3 px-2 text-charcoal">{p.quantity}</td>
                  <td className="py-3 px-2 text-charcoal">₹{p.total.toLocaleString()}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-mink text-sm">No sales data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div>
          <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Low Stock Alerts</h2>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs tracking-widest uppercase text-mink border-b border-stone">
                  <th className="text-left py-3 px-2">Product ID</th>
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id} className="border-b border-stone/50 hover:bg-white/20 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs text-mink">{p.id}</td>
                    <td className="py-3 px-2 text-charcoal">{p.name}</td>
                    <td className="py-3 px-2"><span className="px-2 py-0.5 text-xs bg-red-100 text-red-600">{p.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
