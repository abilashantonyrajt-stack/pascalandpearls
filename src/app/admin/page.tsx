"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, Timestamp, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Product } from "@/lib/products";
import type { Order } from "@/lib/orders";
import { LoaderCircle, LayoutDashboard, ShoppingBag, Package, Users, Eye, Ticket, Check, Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight, FileText, MessageSquare, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface UserDoc {
  id: string;
  name: string;
  email: string;
  createdAt: Timestamp;
}

type Tab = "overview" | "orders" | "products" | "coupons" | "reviews" | "content" | "users";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "products", label: "Products", icon: Package },
  { key: "coupons", label: "Coupons", icon: Ticket },
  { key: "reviews", label: "Reviews", icon: MessageSquare },
  { key: "content", label: "Content", icon: FileText },
  { key: "users", label: "Users", icon: Users },
];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  if (!authed) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong p-8 w-full max-w-xs">
          <h1 className="text-sm tracking-widest uppercase text-charcoal mb-4 text-center">Admin</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full glass-input px-4 py-3 text-sm text-charcoal mb-4" onKeyDown={(e) => e.key === "Enter" && password === "admin123" && setAuthed(true)} />
          <button onClick={() => password === "admin123" && setAuthed(true)} className="w-full text-xs tracking-widest uppercase bg-charcoal text-ivory py-3 hover:bg-charcoal-deep transition-colors">Enter</button>
          {password && password !== "admin123" && <p className="text-xs text-red-500 mt-2 text-center">Wrong password</p>}
        </div>
    </div>
  );
  }

  return <AdminDashboard />;
}

interface SiteContent {
  [key: string]: any;
}

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
      }
    );
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product));
    });
    const unsubContent = onSnapshot(collection(db, "siteContent"), (snap) => {
      const content: SiteContent = {};
      snap.docs.forEach((d) => { content[d.id] = d.data(); });
      setSiteContent(content);
    });
    (async () => { try { const r = await fetch("/api/admin/users"); if (r.ok) setUsers(await r.json()); } catch {} })();
    setLoading(false);
    return () => { unsubOrders(); unsubProducts(); unsubContent(); };
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const codPending = orders.filter((o) => o.paymentMethod === "cod").length;
  const upiTotal = orders.filter((o) => o.paymentMethod === "upi").length;
  const completedOrders = orders.filter((o) => o.paymentStatus === "completed").length;
  const ordersToday = orders.filter((o) => {
    const d = o.createdAt?.toMillis();
    if (!d) return false;
    return new Date(d).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-light text-charcoal tracking-widest uppercase mb-4">Admin Dashboard</h1>
          <div className="flex gap-1 flex-wrap">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase transition-colors ${tab === t.key ? "bg-charcoal text-ivory" : "text-mink hover:text-charcoal"}`}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><LoaderCircle size={24} className="animate-spin text-mink" /></div>
        ) : tab === "overview" ? (
          <OverviewTab orders={orders} totalRevenue={totalRevenue} codPending={codPending} upiTotal={upiTotal} completedOrders={completedOrders} ordersToday={ordersToday} productsCount={products.length} usersCount={users.length} products={products} />
        ) : tab === "orders" ? (
          <OrdersTab orders={orders} onOrdersChange={() => {}} />
        ) : tab === "products" ? (
          <ProductsTab products={products} onProductsChange={() => {}} />
        ) : tab === "coupons" ? (
          <CouponsTab />
        ) : tab === "reviews" ? (
          <ReviewsTab products={products} />
        ) : tab === "content" ? (
          <ContentTab siteContent={siteContent} onContentChange={() => {}} />
        ) : (
          <UsersTab users={users} />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass-card p-6 flex flex-col">
      <span className="text-xs tracking-widest uppercase text-mink mb-1">{label}</span>
      <span className="text-2xl font-light text-charcoal">{value}</span>
      {sub && <span className="text-xs text-mink mt-1">{sub}</span>}
    </div>
  );
}

function OverviewTab({ orders, totalRevenue, codPending, upiTotal, completedOrders, ordersToday, productsCount, usersCount, products }: {
  orders: Order[]; totalRevenue: number; codPending: number; upiTotal: number; completedOrders: number; ordersToday: number; productsCount: number; usersCount: number; products: Product[];
}) {
  const recentOrders = orders.slice(0, 8);
  const lowStock = products.filter(p => p.stock <= 3 && p.stock > 0);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length} sub={`${ordersToday} today`} />
        <StatCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        <StatCard label="UPI Payments" value={upiTotal} />
        <StatCard label="COD Orders" value={codPending} sub={completedOrders > 0 ? `${completedOrders} paid` : undefined} />
        <StatCard label="Products" value={productsCount} />
        <StatCard label="Users" value={usersCount} />
      </div>
      <div>
        <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs tracking-widest uppercase text-mink border-b border-stone"><th className="text-left py-3 px-2">Order ID</th><th className="text-left py-3 px-2">Customer</th><th className="text-left py-3 px-2">Total</th><th className="text-left py-3 px-2">Payment</th><th className="text-left py-3 px-2">Payment</th><th className="text-left py-3 px-2">Fulfillment</th><th className="text-left py-3 px-2">Date</th></tr></thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-stone/50 hover:bg-white/20 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs text-charcoal">#{o.id?.slice(0, 8)}</td>
                  <td className="py-3 px-2 text-charcoal">{o.customerDetails?.name}</td>
                  <td className="py-3 px-2 text-charcoal">₹{o.totalAmount}</td>
                  <td className="py-3 px-2"><span className={`px-2 py-0.5 text-xs ${o.paymentMethod === "upi" ? "bg-charcoal/10 text-charcoal" : "bg-stone/30 text-mink"}`}>{o.paymentMethod === "upi" ? "UPI" : "COD"}</span></td>
                  <td className="py-3 px-2"><span className={`px-2 py-0.5 text-xs ${o.paymentStatus === "completed" ? "bg-green-100 text-green-700" : o.paymentStatus === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{o.paymentStatus}</span></td>
                  <td className="py-3 px-2"><span className={`px-2 py-0.5 text-xs ${o.fulfillmentStatus === "delivered" ? "bg-green-100 text-green-700" : o.fulfillmentStatus === "shipped" ? "bg-blue-100 text-blue-700" : o.fulfillmentStatus === "cancelled" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{o.fulfillmentStatus || "pending"}</span></td>
                  <td className="py-3 px-2 text-mink text-xs">{o.createdAt ? new Date(o.createdAt.toMillis()).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-mink text-sm">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {lowStock.length > 0 && (
        <div>
          <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Low Stock Alerts</h2>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs tracking-widest uppercase text-mink border-b border-stone"><th className="text-left py-3 px-2">Product ID</th><th className="text-left py-3 px-2">Name</th><th className="text-left py-3 px-2">Stock</th></tr></thead>
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

function OrdersTab({ orders, onOrdersChange }: { orders: Order[]; onOrdersChange: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const fulfillmentOptions = ["pending", "shipped", "delivered", "cancelled"];

  async function handleUpdateStatus(orderId: string, paymentStatus?: string, fulfillmentStatus?: string) {
    setUpdating(orderId);
    try {
      await fetch("/api/update-order-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...(paymentStatus ? { paymentStatus } : {}), ...(fulfillmentStatus ? { fulfillmentStatus } : {}) }),
      });
      onOrdersChange();
    } catch {}
    setUpdating(null);
  }

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      o.customerDetails?.name?.toLowerCase().includes(q) ||
      o.customerDetails?.email?.toLowerCase().includes(q) ||
      o.customerDetails?.phone?.includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm tracking-widest uppercase text-charcoal">All Orders ({orders.length})</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mink" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..." className="glass-input pl-9 pr-4 py-2 text-xs text-charcoal focus:outline-none w-56" />
          </div>
          <button onClick={() => {
            const headers = "Order ID,Date,Customer Name,Email,Phone,Address,Items,Total,Payment Method,Payment Status,Fulfillment Status,Tracking,Notes,Discount";
            const rows = filtered.map(o => {
              const items = o.items?.map(item => `${item.name} x${item.quantity}`).join("; ") || "";
              const date = o.createdAt ? new Date(o.createdAt.toMillis()).toLocaleDateString("en-IN") : "";
              const address = o.customerDetails ? `${o.customerDetails.address}, ${o.customerDetails.city}, ${o.customerDetails.state} ${o.customerDetails.pincode}` : "";
              const discount = o.discountPercent ? `${o.discountPercent}%` : "";
              return [o.id, date, o.customerDetails?.name || "", o.customerDetails?.email || "", o.customerDetails?.phone || "", address, items, o.totalAmount, o.paymentMethod, o.paymentStatus, o.fulfillmentStatus || "pending", o.trackingNumber || "", o.notes || "", discount].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
            }).join("\n");
            const csv = headers + "\n" + rows;
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `orders_export_${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }} className="flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors"><FileText size={14} /> Export CSV</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-mink text-sm">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {paged.map((o) => {
            const isExpanded = expanded === o.id;
            return (
            <div key={o.id} className="glass-card overflow-hidden">
              <button onClick={() => setExpanded(isExpanded ? null : o.id!)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-mono text-xs text-charcoal bg-ivory px-2 py-1">#{o.id?.slice(0, 8)}</span>
                  <span className="text-sm text-charcoal">{o.customerDetails?.name}</span>
                  <span className="text-xs text-mink">{o.customerDetails?.email}</span>
                  <span className="text-sm text-charcoal">₹{o.totalAmount}</span>
                  <span className={`px-2 py-0.5 text-xs ${o.paymentMethod === "upi" ? "bg-charcoal/10 text-charcoal" : "bg-stone/30 text-mink"}`}>{o.paymentMethod === "upi" ? "UPI" : "COD"}</span>
                  {o.transactionId && <span className="font-mono text-[10px] text-mink">Txn: {o.transactionId.slice(0, 12)}...</span>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 text-xs ${o.paymentMethod === "upi" ? "bg-charcoal/10 text-charcoal" : "bg-stone/30 text-mink"}`}>{o.paymentMethod === "upi" ? "UPI" : "COD"}</span>
                    <span className={`px-2 py-0.5 text-xs ${o.paymentStatus === "completed" ? "bg-green-100 text-green-700" : o.paymentStatus === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>Payment: {o.paymentStatus}</span>
                    <span className={`px-2 py-0.5 text-xs ${o.fulfillmentStatus === "delivered" ? "bg-green-100 text-green-700" : o.fulfillmentStatus === "shipped" ? "bg-blue-100 text-blue-700" : o.fulfillmentStatus === "cancelled" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>Fulfillment: {o.fulfillmentStatus || "pending"}</span>
                    {o.transactionId && <span className="font-mono text-[10px] text-mink">Txn: {o.transactionId.slice(0, 12)}...</span>}
                  </div>
                </div>
                <Eye size={14} className="text-mink shrink-0" />
              </button>
              {isExpanded && (
                <div className="border-t border-stone/50 p-4 space-y-4 text-sm">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs tracking-widest uppercase text-mink mb-2">Shipping Details</p>
                      <div className="space-y-1 text-charcoal">
                        <p>{o.customerDetails?.name}</p>
                        <p>{o.customerDetails?.email}</p>
                        <p>{o.customerDetails?.phone}</p>
                        <p>{o.customerDetails?.address}</p>
                        <p>{o.customerDetails?.city}, {o.customerDetails?.state} — {o.customerDetails?.pincode}</p>
                      </div>
                      {o.notes && (
                        <div className="mt-3">
                          <p className="text-xs tracking-widest uppercase text-mink mb-1">Order Notes</p>
                          <p className="text-sm text-charcoal bg-white/30 p-2">{o.notes}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-mink mb-2">Payment & Transaction</p>
                      <div className="space-y-1 text-charcoal">
                        <p>Method: {o.paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}</p>
                        <p>Status: {o.paymentStatus === "completed" ? "Paid" : o.paymentStatus === "pending" ? "Pending" : "Failed"}</p>
                        {o.transactionId && <p className="font-mono text-xs">Txn ID: {o.transactionId}</p>}
                        <p>Order ID: <span className="font-mono">{o.id}</span></p>
                        <p>Date: {o.createdAt ? new Date(o.createdAt.toMillis()).toLocaleString("en-IN") : "-"}</p>
                        {o.discountPercent ? <p>Discount: {o.discountPercent}%</p> : null}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-stone/50 pt-4">
                    <p className="text-xs tracking-widest uppercase text-mink mb-2">Payment Status</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {["pending", "completed", "failed"].map((s) => (
                        <button key={s} onClick={() => handleUpdateStatus(o.id!, s, undefined)} disabled={updating === o.id || o.paymentStatus === s} className={`flex items-center gap-1 text-xs px-3 py-1 transition-colors ${o.paymentStatus === s ? "bg-charcoal text-ivory" : "bg-stone/30 text-mink hover:bg-stone/50"} disabled:opacity-50`}>
                          {updating === o.id && o.paymentStatus !== s ? <LoaderCircle size={12} className="animate-spin" /> : null}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-stone/50 pt-4">
                    <p className="text-xs tracking-widest uppercase text-mink mb-2">Fulfillment Status</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {fulfillmentOptions.map((s) => (
                        <button key={s} onClick={() => handleUpdateStatus(o.id!, undefined, s)} disabled={updating === o.id || (o.fulfillmentStatus || "pending") === s} className={`flex items-center gap-1 text-xs px-3 py-1 transition-colors ${(o.fulfillmentStatus || "pending") === s ? "bg-charcoal text-ivory" : "bg-stone/30 text-mink hover:bg-stone/50"} disabled:opacity-50`}>
                          {updating === o.id && (o.fulfillmentStatus || "pending") !== s ? <LoaderCircle size={12} className="animate-spin" /> : null}
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input type="text" placeholder="Tracking number" defaultValue={o.trackingNumber || ""} onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (val && val !== o.trackingNumber) {
                          await fetch("/api/update-order-status", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: o.id, trackingNumber: val }),
                          });
                          onOrdersChange();
                        }
                      }} className="flex-1 glass-input px-3 py-1.5 text-xs text-charcoal focus:outline-none" />
                      {o.trackingNumber && <span className="text-[10px] text-mink font-mono">{o.trackingNumber}</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase text-mink mb-2">Items ({o.items?.length})</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {o.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/30 px-3 py-2">
                          <div className="flex items-center gap-3">
                            {item.image && <img src={item.image} alt="" className="w-10 h-10 object-cover rounded" />}
                            <div>
                              <p className="text-charcoal">{item.name}</p>
                              <p className="text-[10px] text-mink">Product ID: <span className="font-mono">{item.productId}</span></p>
                            </div>
                          </div>
                          <p className="text-charcoal">x{item.quantity} — ₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 text-mink hover:text-charcoal disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-xs text-mink">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 text-mink hover:text-charcoal disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProductsTab({ products, onProductsChange }: { products: Product[]; onProductsChange: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    getDocs(collection(db, "categories")).then(snap => setCategories(snap.docs.map(d => ({id: d.id, name: d.data().name}))));
  }, []);

  const [form, setForm] = useState({
    name: "", price: "", description: "", category: "", stock: "10", featured: false, material: "", images: "",
  });

  function resetForm() {
    setForm({ name: "", price: "", description: "", category: "", stock: "10", featured: false, material: "", images: "" });
    setEditing(null);
    setShowForm(false);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description || "",
      category: p.category,
      stock: String(p.stock),
      featured: p.featured,
      material: p.material || "",
      images: p.images?.join(", ") || "",
    });
    setEditing(p);
    setShowForm(true);
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImageUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `products/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    setForm((prev) => ({
      ...prev,
      images: prev.images ? `${prev.images}, ${urls.join(", ")}` : urls.join(", "),
    }));
    setImageUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return;
    setSaving(true);
    const payload = {
      ...(editing ? { id: editing.id } : {}),
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category,
      stock: Number(form.stock),
      featured: form.featured,
      material: form.material,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      const res = await fetch("/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetForm();
        onProductsChange();
      }
    } catch {}
    setSaving(false);
  }

  async function handleDelete(productId: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, { method: "DELETE" });
      if (res.ok) onProductsChange();
    } catch {}
  }

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm tracking-widest uppercase text-charcoal">All Products ({products.length})</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mink" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="glass-input pl-9 pr-4 py-2 text-xs text-charcoal focus:outline-none w-48" />
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors"><Plus size={14} /> Add Product</button>
        </div>
      </div>

      <div className="mb-4">
        <button onClick={() => setShowCategories(!showCategories)} className="flex items-center gap-2 text-xs tracking-widest uppercase border border-stone text-mink px-4 py-2 hover:bg-stone/30 transition-colors">
          {showCategories ? "Done Managing Categories" : "Manage Categories"}
        </button>
      </div>
      {showCategories && (
        <div className="glass-card p-6 mb-6 max-w-2xl">
          <h3 className="text-xs tracking-widest uppercase text-charcoal mb-4">Categories</h3>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" className="flex-1 glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
            <button onClick={async () => {
              if (!newCategory.trim()) return;
              await addDoc(collection(db, "categories"), { name: newCategory.trim() });
              setNewCategory("");
              const snap = await getDocs(collection(db, "categories"));
              setCategories(snap.docs.map(d => ({id: d.id, name: d.data().name})));
            }} className="flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors"><Plus size={14} /> Add</button>
          </div>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white/30 px-4 py-2">
                <span className="text-sm text-charcoal">{c.name}</span>
                <button onClick={async () => {
                  await deleteDoc(doc(db, "categories", c.id));
                  setCategories(prev => prev.filter(cat => cat.id !== c.id));
                }} className="p-1 text-mink hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-mink">No categories yet.</p>}
          </div>
        </div>
      )}
      {showForm && (
        <div className="glass-card p-6 mb-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs tracking-widest uppercase text-charcoal">{editing ? "Edit Product" : "New Product"}</h3>
            <button onClick={resetForm} className="text-mink hover:text-charcoal"><X size={16} /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" required />
            </div>
            <div>
              <label className="text-xs tracking-wider text-mink mb-1 block">Price *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" required />
            </div>
            <div>
              <label className="text-xs tracking-wider text-mink mb-1 block">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" required>
                <option value="">Select</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name.charAt(0).toUpperCase() + c.name.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs tracking-wider text-mink mb-1 block">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-charcoal" />
                <span className="text-xs tracking-widest uppercase text-mink">Featured</span>
              </label>
            </div>
            <div>
              <label className="text-xs tracking-wider text-mink mb-1 block">Material</label>
              <input type="text" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="e.g. Gold-plated" className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider text-mink mb-1 block">Images</label>
              <div className="flex items-center gap-3 mb-2">
                <label className={`flex items-center gap-2 text-xs tracking-widest uppercase cursor-pointer px-4 py-2 ${imageUploading ? "bg-mink/20 text-mink" : "bg-charcoal text-ivory hover:bg-charcoal-deep"} transition-colors`}>
                  {imageUploading ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
                  {imageUploading ? "Uploading..." : "Upload Images"}
                  <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e.target.files)} className="hidden" disabled={imageUploading} />
                </label>
                <span className="text-[10px] text-mink">or paste URLs below</span>
              </div>
              <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={2} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none resize-none" />
              {form.images && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.images.split(",").map((url, i) => (
                    url.trim() ? <img key={i} src={url.trim()} alt="" className="w-12 h-12 object-cover rounded border border-stone" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : null
                  ))}
                </div>
              )}
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-50">{saving ? "Saving..." : editing ? "Update Product" : "Create Product"}</button>
              <button type="button" onClick={resetForm} className="text-xs tracking-widest uppercase border border-stone text-mink px-6 py-3 hover:bg-stone/30 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-mink text-sm">No products found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs tracking-widest uppercase text-mink border-b border-stone"><th className="text-left py-3 px-2">Product ID</th><th className="text-left py-3 px-2">Image</th><th className="text-left py-3 px-2">Name</th><th className="text-left py-3 px-2">Category</th><th className="text-left py-3 px-2">Price</th><th className="text-left py-3 px-2">Stock</th><th className="text-left py-3 px-2">Featured</th><th className="text-left py-3 px-2">Actions</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-stone/50 hover:bg-white/20 transition-colors">
                  <td className="py-3 px-2 font-mono text-[10px] text-mink">{p.id}</td>
                  <td className="py-3 px-2">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded" />}</td>
                  <td className="py-3 px-2 text-charcoal font-medium">{p.name}</td>
                  <td className="py-3 px-2 text-xs text-mink">{p.category}</td>
                  <td className="py-3 px-2 text-charcoal">₹{p.price}</td>
                  <td className="py-3 px-2"><span className={`px-2 py-0.5 text-xs ${p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{p.stock}</span></td>
                  <td className="py-3 px-2">{p.featured ? <span className="text-[10px] bg-charcoal/10 text-charcoal px-2 py-0.5">Yes</span> : "-"}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-mink hover:text-charcoal transition-colors" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-mink hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
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

function CouponsTab() {
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [expires, setExpires] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !percent) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), discountPercent: parseInt(percent), expiresAt: expires || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error); } else { setMsg("Coupon created!"); setCode(""); setPercent(""); setExpires(""); }
    } catch {
      setMsg("Failed to create coupon");
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Create Coupon</h2>
      <form onSubmit={handleCreate} className="glass-card p-6 space-y-4 max-w-md">
        <div>
          <label className="text-xs tracking-widest uppercase text-mink mb-1 block">Coupon Code</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. WELCOME20" className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" required />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-mink mb-1 block">Discount (%)</label>
          <input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} min="1" max="100" className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" required />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-mink mb-1 block">Expires (optional)</label>
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-50">{loading ? "Creating..." : "Create Coupon"}</button>
        {msg && <p className={`text-xs ${msg === "Coupon created!" ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
      </form>
    </div>
  );
}

function ContentTab({ siteContent, onContentChange }: { siteContent: SiteContent; onContentChange: () => void }) {
  const [saving, setSaving] = useState<string | null>(null);

  const SECTIONS = [
    {
      key: "hero_banner",
      label: "Hero Banner",
      fields: [
        { key: "image", label: "Banner Image URL", type: "image" },
        { key: "headline", label: "Headline", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "cta", label: "CTA Button Text", type: "text" },
        { key: "ctaLink", label: "CTA Link", type: "text" },
      ],
    },
    {
      key: "announcement_bar",
      label: "Announcement Bar",
      fields: [
        { key: "text", label: "Announcement Text", type: "text" },
      ],
    },
    {
      key: "about_section",
      label: "About Section",
      fields: [
        { key: "image", label: "About Image URL", type: "image" },
        { key: "title", label: "Title", type: "text" },
        { key: "content", label: "Content", type: "textarea" },
      ],
    },
    {
      key: "footer_content",
      label: "Footer Content",
      fields: [
        { key: "description", label: "Footer Description", type: "textarea" },
        { key: "copyright", label: "Copyright Text", type: "text" },
      ],
    },
  ];

  async function handleSave(key: string, data: any) {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data }),
      });
      if (res.ok) onContentChange();
    } catch {}
    setSaving(null);
  }

  return (
    <div>
      <h2 className="text-sm tracking-widest uppercase text-charcoal mb-6">Site Content</h2>
      <div className="grid gap-6">
        {SECTIONS.map((section) => {
          const content = siteContent[section.key] || {};
          const active = content.active ?? false;
          return (
            <div key={section.key} className="glass-card p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSave(section.key, { ...content, active }); }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs tracking-widest uppercase text-charcoal">{section.label}</h3>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-mink cursor-pointer">
                      <input type="checkbox" checked={active} onChange={(e) => {
                        const newContent = { ...content, active: e.target.checked };
                        handleSave(section.key, newContent);
                      }} className="accent-charcoal" />
                      Active
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className="text-xs tracking-wider text-mink mb-1 block">{field.label}</label>
                      {field.type === "textarea" ? (
                        <textarea value={content[field.key] || ""} onChange={(e) => { content[field.key] = e.target.value; }} rows={3} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none resize-none" />
                      ) : field.type === "image" ? (
                        <div className="flex gap-2">
                          <input type="text" value={content[field.key] || ""} onChange={(e) => { content[field.key] = e.target.value; }} placeholder="https://..." className="flex-1 glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
                          {content[field.key] && <img src={content[field.key]} alt="" className="w-10 h-10 object-cover rounded border border-stone shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                        </div>
                      ) : (
                        <input type="text" value={content[field.key] || ""} onChange={(e) => { content[field.key] = e.target.value; }} className="w-full glass-input px-4 py-2 text-sm text-charcoal focus:outline-none" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button type="submit" disabled={saving === section.key} className="flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors disabled:opacity-50">
                    {saving === section.key ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                    Save {section.label}
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewsTab({ products }: { products: Product[] }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "reviews"));
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  function getProductName(productId: string) {
    const p = products.find(p => p.id === productId);
    return p ? p.name : productId;
  }

  async function handleApprove(reviewId: string) {
    await updateDoc(doc(db, "reviews", reviewId), { approved: true });
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: true } : r));
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("Delete this review?")) return;
    await deleteDoc(doc(db, "reviews", reviewId));
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  }

  if (loading) return <div className="flex justify-center py-20"><LoaderCircle size={24} className="animate-spin text-mink" /></div>;

  return (
    <div>
      <h2 className="text-sm tracking-widest uppercase text-charcoal mb-4">Review Moderation ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <div className="text-center py-20 text-mink text-sm">No reviews yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs tracking-widest uppercase text-mink border-b border-stone"><th className="text-left py-3 px-2">Product</th><th className="text-left py-3 px-2">Customer</th><th className="text-left py-3 px-2">Rating</th><th className="text-left py-3 px-2">Comment</th><th className="text-left py-3 px-2">Date</th><th className="text-left py-3 px-2">Actions</th></tr></thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} className="border-b border-stone/50 hover:bg-white/20 transition-colors">
                  <td className="py-3 px-2 text-charcoal">{getProductName(r.productId)}</td>
                  <td className="py-3 px-2 text-mink">{r.name}</td>
                  <td className="py-3 px-2 text-charcoal">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</td>
                  <td className="py-3 px-2 text-mink text-xs max-w-xs truncate">{r.comment || "-"}</td>
                  <td className="py-3 px-2 text-mink text-xs">{r.createdAt ? new Date(r.createdAt.toMillis()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {r.approved ? (
                        <span className="flex items-center gap-1 text-xs text-green-700"><CheckCircle size={14} /> Approved</span>
                      ) : (
                        <button onClick={() => handleApprove(r.id)} className="flex items-center gap-1 text-xs px-3 py-1 bg-charcoal text-ivory hover:bg-charcoal-deep transition-colors"><Check size={12} /> Approve</button>
                      )}
                      <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1 text-xs px-3 py-1 border border-stone text-mink hover:text-red-500 hover:border-red-300 transition-colors"><Trash2 size={12} /> Delete</button>
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

function UsersTab({ users }: { users: UserDoc[] }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm tracking-widest uppercase text-charcoal">Registered Users ({users.length})</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mink" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="glass-input pl-9 pr-4 py-2 text-xs text-charcoal focus:outline-none w-48" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-mink text-sm">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs tracking-widest uppercase text-mink border-b border-stone"><th className="text-left py-3 px-2">Name</th><th className="text-left py-3 px-2">Email</th><th className="text-left py-3 px-2">Signed Up</th></tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-stone/50 hover:bg-white/20 transition-colors">
                  <td className="py-3 px-2 text-charcoal">{u.name}</td>
                  <td className="py-3 px-2 text-mink">{u.email}</td>
                  <td className="py-3 px-2 text-mink text-xs">{new Date(u.createdAt?.toMillis()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
