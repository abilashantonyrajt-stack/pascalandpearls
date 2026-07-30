"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Smartphone, Check, LoaderCircle, ArrowLeft, ImageOff, Wallet, Gift, Ticket } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import PincodeChecker from "@/components/PincodeChecker";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { isLoggedIn, user, login } = useAuth();
  const { format } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [isGuest, setIsGuest] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [brokenImgs, setBrokenImgs] = useState<Record<string, boolean>>({});
  const [otpError, setOtpError] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<"auth" | "details" | "otp" | "payment">(
    isLoggedIn ? "details" : "auth"
  );

  const [customer, setCustomer] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [orderNotes, setOrderNotes] = useState("");

  const [upiTxnId, setUpiTxnId] = useState("");
  const [upiConfirmed, setUpiConfirmed] = useState(false);

  const [otpInput, setOtpInput] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [guestEmail, setGuestEmail] = useState("");
  const [guestPrompt, setGuestPrompt] = useState(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  useEffect(() => {
    if (checkoutStep === "payment" && customer.email) {
      (async () => {
        setLoyaltyLoading(true);
        try {
          const res = await fetch(`/api/loyalty?email=${encodeURIComponent(customer.email)}`);
          const data = await res.json();
          setLoyaltyPoints(data.points ?? 0);
        } catch {}
        setLoyaltyLoading(false);
      })();
    }
  }, [checkoutStep, customer.email]);

  if (items.length === 0) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-mink text-sm mb-4">Your bag is empty.</p>
          <Link href="/shop" className="text-xs tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-ivory transition-colors inline-block">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  const [gcCode, setGcCode] = useState("");
  const [gcDiscount, setGcDiscount] = useState(0);
  const [gcError, setGcError] = useState("");
  const [gcLoading, setGcLoading] = useState(false);

  const shipping = subtotal >= 5000 ? 0 : 299;
  const discount = Math.round(subtotal * (discountPercent / 100));
  const loyaltyDiscount = Math.floor(loyaltyPointsUsed / 100) * 50;
  const total = Math.max(0, subtotal + shipping - discount - loyaltyDiscount - gcDiscount);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error); setDiscountPercent(0); return; }
      setDiscountPercent(data.discountPercent);
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  function isDetailsValid() {
    return customer.name && customer.email && customer.phone && customer.address && customer.city && customer.state && customer.pincode;
  }

  async function handleSendOtp() {
    setOtpSending(true);
    setOtpError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customer.email }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error); return; }
      setCheckoutStep("otp");
      setResendTimer(60);
      if (!isLoggedIn) login(customer.name, customer.email);
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  }

  async function handleVerifyOtp() {
    setOtpError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customer.email, otp: otpInput, name: customer.name }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error); return; }
      setCheckoutStep("payment");
    } catch {
      setOtpError("Failed to verify OTP. Please try again.");
    }
  }

  async function handleApplyGiftCard() {
    if (!gcCode.trim()) return;
    setGcLoading(true);
    setGcError("");
    try {
      const res = await fetch(`/api/gift-cards?code=${encodeURIComponent(gcCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) { setGcError(data.error); setGcDiscount(0); return; }
      if (!data.active) { setGcError("Gift card is inactive"); setGcDiscount(0); return; }
      const applyAmount = Math.min(data.balance, subtotal + shipping - discount - loyaltyDiscount);
      setGcDiscount(applyAmount);
    } catch {
      setGcError("Failed to validate gift card");
    } finally {
      setGcLoading(false);
    }
  }

  async function handlePlaceOrder() {
    setProcessing(true);
    try {
      const orderData = {
        customerDetails: customer,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        totalAmount: total,
        paymentMethod,
        transactionId: paymentMethod === "upi" ? upiTxnId : undefined,
        notes: orderNotes || undefined,
        discountPercent: discountPercent || undefined,
        loyaltyPointsUsed: loyaltyPointsUsed || undefined,
        loyaltyDiscount: loyaltyDiscount || undefined,
        subtotal,
        shipping,
      };

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const { orderId } = await res.json();
      clearCart();
      router.push(`/order-confirmation?id=${orderId}`);
    } catch (err) {
      console.error("Order failed:", err);
      setProcessing(false);
    }
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-light text-charcoal">Checkout</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3 space-y-8">

            {checkoutStep === "auth" && (
              <div className="glass-strong p-6 text-center">
                <p className="text-sm text-mink mb-4">Sign in to proceed with checkout</p>
                <Link href="/auth" className="inline-block text-xs tracking-widest uppercase bg-charcoal text-ivory px-8 py-4 hover:bg-charcoal-deep transition-colors mb-4">Sign In</Link>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone"></div></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-ivory px-3 text-mink">or</span></div>
                </div>
                <button onClick={() => {
                  setIsGuest(true);
                  const guestUser = { name: "Guest", email: "", accountType: "guest" };
                  localStorage.setItem("pnp_user", JSON.stringify(guestUser));
                  login("Guest", "");
                  setCustomer((prev) => ({ ...prev, name: "Guest", email: "" }));
                  setCheckoutStep("details");
                }} className="inline-block text-xs tracking-widest uppercase border border-stone text-mink px-8 py-4 hover:border-charcoal hover:text-charcoal transition-colors">Continue as Guest</button>
              </div>
            )}

            {checkoutStep !== "auth" && (
              <>
                <div>
                  <h2 className="text-sm tracking-widest uppercase text-charcoal mb-6">1. Shipping Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", key: "name", type: "text" },
                      { label: "Email", key: "email", type: "email" },
                      { label: "Phone", key: "phone", type: "tel" },
                      { label: "Address", key: "address", type: "text", full: true },
                      { label: "City", key: "city", type: "text" },
                      { label: "State", key: "state", type: "text" },
                      { label: "PIN Code", key: "pincode", type: "text" },
                    ].map((field) => (
                      <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
                        <label className="text-xs tracking-wider text-mink mb-1 block">{field.label}</label>
                        <input
                          type={field.type}
                          value={(customer as any)[field.key]}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (field.key === "pincode") val = val.replace(/\D/g, "").slice(0, 6);
                            if (field.key === "phone") val = val.replace(/\D/g, "").slice(0, 10);
                            setCustomer({ ...customer, [field.key]: val });
                          }}
                          className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs tracking-wider text-mink mb-1 block">Order Notes (optional)</label>
                      <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Special instructions, gift message, etc." rows={2} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors resize-none" />
                  </div>
                  {checkoutStep === "details" && isDetailsValid() && (
                    <button onClick={handleSendOtp} disabled={otpSending} className="mt-6 w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {otpSending ? <><LoaderCircle size={16} className="animate-spin" /> Sending OTP...</> : "Verify Email with OTP"}
                    </button>
                  )}
                  </div>
                </div>

                <PincodeChecker />

                {checkoutStep === "otp" && (
                  <div className="glass-strong p-6 text-center">
                    <p className="text-xs text-mink mb-2">OTP sent to <span className="text-charcoal font-medium">{customer.email}</span></p>
                    {otpError && <p className="text-xs text-red-500 mb-4">{otpError}</p>}
                    <input type="text" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="w-40 mx-auto text-center tracking-[0.5em] glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors mb-4 block" />
                    <button onClick={handleVerifyOtp} disabled={otpInput.length !== 6} className="w-full text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Verify OTP</button>
                    <div className="mt-3 text-xs">
                      {resendTimer > 0 ? (
                        <span className="text-mink">Resend in {resendTimer}s</span>
                      ) : (
                        <button onClick={handleSendOtp} disabled={otpSending} className="text-gold-dark hover:text-charcoal transition-colors uppercase tracking-widest">Resend OTP</button>
                      )}
                    </div>
                  </div>
                )}

                {(checkoutStep === "payment") && (
                  <div>
                    <h2 className="text-sm tracking-widest uppercase text-charcoal mb-6">2. Payment Method</h2>

                    {isGuest && (
                      <div className="glass-strong p-6 mb-6 text-center space-y-3">
                        <p className="text-sm text-charcoal font-medium">Create an account to track your order</p>
                        <p className="text-xs text-mink">Enter your email and we'll send you order updates</p>
                        <div className="flex gap-2">
                          <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="your@email.com" className="flex-1 glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors" />
                          <button onClick={async () => {
                            if (!guestEmail.trim() || !/\S+@\S+\.\S+/.test(guestEmail)) return;
                            try {
                              const guestUser = { name: "Guest", email: guestEmail.trim(), accountType: "guest" };
                              localStorage.setItem("pnp_user", JSON.stringify(guestUser));
                              setGuestEmail("");
                            } catch {}
                          }} disabled={!guestEmail.trim()} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-4 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-40">Save</button>
                        </div>
                      </div>
                    )}

                    <div className="glass-strong p-4 mb-6">
                      <h3 className="text-xs tracking-widest uppercase text-charcoal mb-3 flex items-center gap-2"><Ticket size={14} /> Redeem Gift Card</h3>
                      <div className="flex gap-2">
                        <input type="text" value={gcCode} onChange={(e) => setGcCode(e.target.value.toUpperCase())} placeholder="GC-XXXXXX" className="flex-1 glass-input px-3 py-2 text-xs text-charcoal placeholder:text-mink/50 focus:outline-none uppercase" />
                        {gcDiscount > 0 ? (
                          <button onClick={() => { setGcDiscount(0); setGcCode(""); setGcError(""); }} className="text-xs tracking-widest uppercase bg-mink/20 text-mink px-3 py-2 hover:bg-mink/30 transition-colors">Remove</button>
                        ) : (
                          <button onClick={handleApplyGiftCard} disabled={gcLoading || !gcCode.trim()} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-3 py-2 hover:bg-charcoal-deep transition-colors disabled:opacity-50">{gcLoading ? "..." : "Apply"}</button>
                        )}
                      </div>
                      {gcError && <p className="text-xs text-red-500 mt-1">{gcError}</p>}
                      {gcDiscount > 0 && <p className="text-xs text-green-600 mt-1">Gift card discount applied: -{format(gcDiscount)}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button onClick={() => setPaymentMethod("upi")} className={`flex items-center justify-center gap-3 px-4 py-4 border text-sm transition-colors ${paymentMethod === "upi" ? "border-gold bg-gold/5 text-charcoal" : "border-stone text-mink hover:border-charcoal"}`}>
                        <Smartphone size={18} />
                        <span className="text-xs tracking-widest uppercase">UPI</span>
                      </button>
                      <button onClick={() => setPaymentMethod("cod")} className={`flex items-center justify-center gap-3 px-4 py-4 border text-sm transition-colors ${paymentMethod === "cod" ? "border-gold bg-gold/5 text-charcoal" : "border-stone text-mink hover:border-charcoal"}`}>
                        <Wallet size={18} />
                        <span className="text-xs tracking-widest uppercase">Cash on Delivery</span>
                      </button>
                    </div>

                    <div className="glass-strong p-4 mb-6">
                      <h3 className="text-xs tracking-widest uppercase text-charcoal mb-3 flex items-center gap-2"><Gift size={14} /> Use Loyalty Points</h3>
                      {loyaltyLoading ? (
                        <LoaderCircle size={16} className="animate-spin text-mink" />
                      ) : (
                        <>
                          <p className="text-sm text-mink mb-2">Available: <span className="text-charcoal font-medium">{loyaltyPoints} pts</span></p>
                          {loyaltyPoints >= 100 ? (
                            <div className="flex items-center gap-2">
                              <input type="number" value={loyaltyPointsUsed} onChange={(e) => setLoyaltyPointsUsed(Math.min(Math.max(0, Number(e.target.value)), Math.floor(loyaltyPoints / 100) * 100))} min="0" max={Math.floor(loyaltyPoints / 100) * 100} step="100" className="w-24 glass-input px-3 py-2 text-xs text-charcoal focus:outline-none text-center" placeholder="0" />
                              <span className="text-xs text-mink">pts = <span className="text-green-600 font-medium">₹{loyaltyDiscount}</span> off</span>
                            </div>
                          ) : (
                            <p className="text-xs text-mink">Earn 100 points to unlock discounts. (1 pt per ₹10 spent)</p>
                          )}
                        </>
                      )}
                    </div>

                    {paymentMethod === "upi" && (
                      <div className="space-y-4 p-6 glass-strong">
                        <div className="text-center">
                          {(() => {
                            const upiLink = `upi://pay?pa=antonyabilash51-2@oksbi&pn=Pascal%20%26%20Pearls&am=${total}&cu=INR&tn=PP${Date.now()}`;
                            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
                            return (
                              <>
                                <div className="w-48 h-48 mx-auto bg-white border border-stone flex items-center justify-center mb-4 overflow-hidden">
                                  <img src={qrUrl} alt="UPI QR Code" className="w-full h-full object-contain p-2"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-center p-4"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gold-dark mb-2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg><p class="text-[10px] tracking-widest uppercase text-mink">Scan to Pay</p></div>';
                                    }} />
                                </div>
                                <a href={upiLink} target="_blank" rel="noopener noreferrer" className="inline-block text-xs tracking-widest uppercase bg-green-600 text-white px-6 py-3 hover:bg-green-700 transition-colors mb-3">Pay with UPI App</a>
                              </>
                            );
                          })()}
                          <p className="text-xs tracking-widest uppercase text-charcoal mb-1">UPI ID: <span className="text-gold-dark">antonyabilash51-2@oksbi</span></p>
                          <p className="text-lg text-charcoal font-medium">{format(total)}</p>
                        </div>
                        <div>
                          <label className="text-xs tracking-wider text-mink mb-1 block">Transaction ID (after payment)</label>
                          <input type="text" value={upiTxnId} onChange={(e) => setUpiTxnId(e.target.value)} placeholder="Enter UPI transaction ID" className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors" />
                        </div>
                        {upiTxnId && (
                          <button onClick={() => setUpiConfirmed(!upiConfirmed)} className={`flex items-center gap-2 text-xs tracking-widest uppercase transition-colors ${upiConfirmed ? "text-green-600" : "text-mink hover:text-charcoal"}`}>
                            <span className={`w-4 h-4 border flex items-center justify-center ${upiConfirmed ? "bg-green-600 border-green-600" : "border-stone"}`}>{upiConfirmed && <Check size={10} className="text-white" />}</span>
                            I have completed the payment
                          </button>
                        )}
                        <button onClick={handlePlaceOrder} disabled={!upiTxnId || !upiConfirmed || processing} className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                          {processing ? <><LoaderCircle size={16} className="animate-spin" /> Processing…</> : `Place Order — ${format(total)}`}
                        </button>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className="space-y-4 p-6 glass-strong">
                        <div className="text-center">
                          <Wallet size={40} className="mx-auto text-gold-dark mb-3" />
                          <p className="text-sm text-charcoal font-medium mb-1">Cash on Delivery</p>
                          <p className="text-xs text-mink">Pay when your order arrives. No online payment needed.</p>
                        </div>
                        <div className="glass p-4 text-xs text-mink space-y-1">
                          <p>• Pay in cash at delivery</p>
                          <p>• No extra charges</p>
                          <p>• Easy returns &amp; exchange</p>
                        </div>
                        <button onClick={handlePlaceOrder} disabled={processing} className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                          {processing ? <><LoaderCircle size={16} className="animate-spin" /> Processing…</> : `Place Order — ${format(total)}`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="glass-strong p-6 sticky top-28">
              <h3 className="text-sm tracking-widest uppercase text-charcoal mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-14 h-14 bg-ivory flex-shrink-0 overflow-hidden relative">
                      {brokenImgs[item.productId] ? (
                        <div className="w-full h-full flex items-center justify-center text-mink/30"><ImageOff size={14} /></div>
                      ) : (
                        <img src={item.image} alt={item.name} onError={() => setBrokenImgs((prev) => ({ ...prev, [item.productId]: true }))} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal truncate">{item.name}</p>
                      <p className="text-xs text-mink">Qty: {item.quantity}</p>
                      <p className="text-sm text-gold-dark">{format(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-mink">Subtotal</span><span className="text-charcoal">{format(subtotal)}</span></div>
                <div className="flex gap-2 py-1">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="flex-1 glass-input px-3 py-2 text-xs text-charcoal placeholder:text-mink/50 focus:outline-none" />
                  {discountPercent > 0 ? (
                    <button onClick={() => { setDiscountPercent(0); setCouponCode(""); setCouponError(""); }} className="text-xs tracking-widest uppercase bg-mink/20 text-mink px-3 py-2 hover:bg-mink/30 transition-colors">Remove</button>
                  ) : (
                    <button onClick={handleApplyCoupon} disabled={couponLoading} className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-3 py-2 hover:bg-charcoal-deep transition-colors disabled:opacity-50">{couponLoading ? "..." : "Apply"}</button>
                  )}
                </div>
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                <div className="flex justify-between"><span className="text-mink">Shipping</span><span className="text-charcoal">{shipping === 0 ? "Free" : format(shipping)}</span></div>
                <p className="text-[10px] text-mink/60 italic">Estimated delivery: 3-5 business days</p>
                {discountPercent > 0 && <div className="flex justify-between"><span className="text-mink">Discount ({discountPercent}%)</span><span className="text-green-600">-{format(discount)}</span></div>}
                {loyaltyDiscount > 0 && <div className="flex justify-between"><span className="text-mink">Loyalty Points</span><span className="text-green-600">-{format(loyaltyDiscount)}</span></div>}
                <div className="flex justify-between border-t border-stone pt-2 font-medium"><span className="text-charcoal">Total</span><span className="text-charcoal">{format(total)}</span></div>
              </div>
              <Link href="/cart" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors mt-4"><ArrowLeft size={14} /> Edit Cart</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
