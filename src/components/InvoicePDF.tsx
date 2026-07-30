"use client";

import { FileText } from "lucide-react";

const GLASS_BUTTON =
  "inline-flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-2 hover:bg-charcoal-deep transition-colors backdrop-blur-md bg-opacity-80 border border-white/10 shadow-lg";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  productId?: string;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Order {
  id: string;
  customerDetails: CustomerDetails;
  items: InvoiceItem[];
  totalAmount: number;
  subtotal?: number;
  discountPercent?: number;
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentStatus?: string;
  createdAt?: { toMillis: () => number } | number;
  transactionId?: string;
  notes?: string;
}

export default function InvoicePDF({ order }: { order: any }) {
  const o = order as Order;
  const subtotal = o.subtotal ?? o.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = o.discountPercent ? (subtotal * o.discountPercent) / 100 : 0;
  const date = o.createdAt
    ? typeof o.createdAt === "object"
      ? new Date(o.createdAt.toMillis()).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date(o.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
    : "-";

  function generateInvoiceHTML(): string {
    const itemsRows = o.items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #e5d9cc;text-align:left;">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #e5d9cc;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #e5d9cc;text-align:right;">₹${item.price}</td>
            <td style="padding:8px;border-bottom:1px solid #e5d9cc;text-align:right;">₹${item.price * item.quantity}</td>
          </tr>`
      )
      .join("");

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice-${o.id}</title>
<style>
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #3c2a1f; margin: 0; padding: 40px; background: #faf6f0; }
  .invoice { max-width: 700px; margin: 0 auto; background: #fff; padding: 40px; box-shadow: 0 2px 20px rgba(0,0,0,0.06); border: 1px solid #e5d9cc; }
  h1 { font-size: 20px; letter-spacing: 4px; text-transform: uppercase; font-weight: 300; color: #3c2a1f; margin: 0 0 4px; }
  .subtitle { font-size: 11px; color: #b8a08a; letter-spacing: 2px; text-transform: uppercase; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #3c2a1f; }
  .details { display: flex; justify-content: space-between; margin-bottom: 32px; font-size: 13px; line-height: 1.8; }
  .details strong { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #b8a08a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #b8a08a; padding: 8px; border-bottom: 2px solid #3c2a1f; text-align: left; }
  .totals { text-align: right; font-size: 14px; line-height: 2; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5d9cc; }
  .grand-total { font-size: 18px; font-weight: bold; }
  .footer { text-align: center; font-size: 11px; color: #b8a08a; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5d9cc; }
  .badge { display: inline-block; padding: 2px 10px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; background: #f0ebe5; color: #3c2a1f; }
</style></head>
<body>
<div class="invoice">
  <div class="header">
    <div>
      <h1>Pascal &amp; Pearls</h1>
      <div class="subtitle">Fine Jewellery</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b8a08a;">Invoice</div>
      <div style="font-family:monospace;font-size:12px;color:#3c2a1f;margin-top:4px;">#${o.id?.slice(0, 12)}</div>
    </div>
  </div>

  <div class="details">
    <div>
      <strong>Bill To</strong>
      <div style="margin-top:4px;">${o.customerDetails.name}</div>
      <div>${o.customerDetails.email}</div>
      ${o.customerDetails.phone ? `<div>${o.customerDetails.phone}</div>` : ""}
      ${o.customerDetails.address ? `<div>${o.customerDetails.address}${o.customerDetails.city ? `, ${o.customerDetails.city}` : ""}${o.customerDetails.state ? `, ${o.customerDetails.state}` : ""}${o.customerDetails.pincode ? ` — ${o.customerDetails.pincode}` : ""}</div>` : ""}
    </div>
    <div style="text-align:right;">
      <strong>Invoice Date</strong>
      <div style="margin-top:4px;">${date}</div>
      <div style="margin-top:8px;"><span class="badge">${o.paymentStatus}</span></div>
      <div style="margin-top:4px;"><span class="badge">${o.paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}</span></div>
    </div>
  </div>

  <table>
    <thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>

  <div class="totals">
    <div>Subtotal: ₹${subtotal}</div>
    ${discount > 0 ? `<div>Discount (${o.discountPercent}%): -₹${discount.toFixed(2)}</div>` : ""}
    <div>Shipping: <span style="color:#b8a08a;">Free</span></div>
    <div class="grand-total">Total: ₹${o.totalAmount}</div>
    ${o.transactionId ? `<div style="font-size:11px;color:#b8a08a;margin-top:8px;">Transaction ID: ${o.transactionId}</div>` : ""}
    ${o.notes ? `<div style="font-size:11px;color:#b8a08a;margin-top:4px;">Notes: ${o.notes}</div>` : ""}
  </div>

  <div class="footer">
    <p>Thank you for your purchase!</p>
    <p style="margin-top:4px;">Pascal &amp; Pearls — pascal-and-pearls.vercel.app</p>
  </div>
</div>
</body></html>`;
  }

  function handleDownload() {
    const html = generateInvoiceHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${o.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={handleDownload} className={GLASS_BUTTON}>
      <FileText size={14} /> Download Invoice
    </button>
  );
}
