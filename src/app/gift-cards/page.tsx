"use client";

import { useState } from "react";
import { Gift, Ticket, Check, Copy, LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { generateGiftCardCode } from "@/lib/giftCards";
import { formatPrice } from "@/lib/utils";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function GiftCardsPage() {
  const { isLoggedIn, user } = useAuth();
  const [tab, setTab] = useState<"buy" | "redeem">("buy");

  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [senderName, setSenderName] = useState(isLoggedIn ? user?.name || "" : "");
  const [senderEmail, setSenderEmail] = useState(isLoggedIn ? user?.email || "" : "");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [buying, setBuying] = useState(false);
  const [purchasedCode, setPurchasedCode] = useState("");
  const [buyError, setBuyError] = useState("");

  const [redeemCode, setRedeemCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [gcData, setGcData] = useState<any>(null);
  const [gcError, setGcError] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState("");

  const selectedAmount = customAmount ? Number(customAmount) : amount;

  async function handleBuy() {
    if (!senderName || !senderEmail || !recipientName || !recipientEmail || !selectedAmount) return;
    setBuying(true);
    setBuyError("");
    const code = generateGiftCardCode();
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          amount: selectedAmount,
          senderEmail,
          senderName,
          recipientEmail,
          recipientName,
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setBuyError(data.error || "Failed to create gift card");
        return;
      }
      setPurchasedCode(code);
    } catch {
      setBuyError("Failed to create gift card. Please try again.");
    } finally {
      setBuying(false);
    }
  }

  async function handleCheck() {
    if (!redeemCode.trim()) return;
    setChecking(true);
    setGcError("");
    setGcData(null);
    try {
      const res = await fetch(`/api/gift-cards?code=${encodeURIComponent(redeemCode.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        setGcError(data.error || "Gift card not found");
        return;
      }
      const data = await res.json();
      setGcData(data);
    } catch {
      setGcError("Failed to check gift card");
    } finally {
      setChecking(false);
    }
  }

  async function handleRedeem() {
    if (!gcData || !gcData.balance) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim(), amount: gcData.balance }),
      });
      if (!res.ok) {
        const data = await res.json();
        setRedeemResult(data.error || "Redemption failed");
        return;
      }
      const data = await res.json();
      setRedeemResult(`Successfully redeemed! Remaining balance: ${formatPrice(data.remainingBalance)}`);
      setGcData((prev: any) => ({ ...prev, balance: data.remainingBalance }));
    } catch {
      setRedeemResult("Redemption failed. Please try again.");
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="glass-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-light text-charcoal">Gift Cards</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-1 mb-8 border-b border-stone">
          <button
            onClick={() => setTab("buy")}
            className={`flex items-center gap-2 px-6 py-3 text-xs tracking-widest uppercase transition-colors ${tab === "buy" ? "border-b-2 border-charcoal text-charcoal" : "text-mink hover:text-charcoal"}`}
          >
            <Gift size={14} /> Buy a Gift Card
          </button>
          <button
            onClick={() => setTab("redeem")}
            className={`flex items-center gap-2 px-6 py-3 text-xs tracking-widest uppercase transition-colors ${tab === "redeem" ? "border-b-2 border-charcoal text-charcoal" : "text-mink hover:text-charcoal"}`}
          >
            <Ticket size={14} /> Redeem
          </button>
        </div>

        {tab === "buy" && (
          <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto">
            {purchasedCode ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <h2 className="text-lg font-medium text-charcoal mb-2">Gift Card Created!</h2>
                <p className="text-sm text-mink mb-4">Share this code with the recipient:</p>
                <div className="bg-charcoal/5 border border-stone rounded px-6 py-4 mb-4 inline-block">
                  <span className="text-2xl tracking-wider text-charcoal font-mono">{purchasedCode}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(purchasedCode)}
                  className="inline-flex items-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory px-6 py-3 hover:bg-charcoal-deep transition-colors"
                >
                  <Copy size={14} /> Copy Code
                </button>
                <button
                  onClick={() => { setPurchasedCode(""); setMessage(""); setCustomAmount(""); setRecipientName(""); setRecipientEmail(""); }}
                  className="block mx-auto mt-4 text-xs text-mink hover:text-charcoal transition-colors"
                >
                  Buy Another
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-xs tracking-wider text-mink mb-2 block">Amount</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRESET_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setAmount(a); setCustomAmount(""); }}
                        className={`px-5 py-2 text-sm border transition-colors ${amount === a && !customAmount ? "border-charcoal bg-charcoal text-ivory" : "border-stone text-charcoal hover:border-charcoal"}`}
                      >
                        {formatPrice(a)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-wider text-mink mb-1 block">Your Name</label>
                    <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider text-mink mb-1 block">Your Email</label>
                    <input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider text-mink mb-1 block">Recipient Name</label>
                    <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" required />
                  </div>
                  <div>
                    <label className="text-xs tracking-wider text-mink mb-1 block">Recipient Email</label>
                    <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs tracking-wider text-mink mb-1 block">Message (optional)</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none resize-none" />
                </div>
                {buyError && <p className="text-xs text-red-500">{buyError}</p>}
                <button
                  onClick={handleBuy}
                  disabled={buying || !senderName || !senderEmail || !recipientName || !recipientEmail || !selectedAmount}
                  className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {buying ? <><LoaderCircle size={16} className="animate-spin" /> Creating...</> : `Buy Gift Card — ${formatPrice(selectedAmount)}`}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "redeem" && (
          <div className="glass-card p-6 sm:p-8 max-w-lg mx-auto">
            <div className="space-y-5">
              <div>
                <label className="text-xs tracking-wider text-mink mb-1 block">Gift Card Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="GC-XXXXXX"
                    className="flex-1 glass-input px-4 py-3 text-sm text-charcoal focus:outline-none uppercase"
                  />
                  <button
                    onClick={handleCheck}
                    disabled={checking || !redeemCode.trim()}
                    className="text-xs tracking-widest uppercase bg-charcoal text-ivory px-5 py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-50"
                  >
                    {checking ? <LoaderCircle size={14} className="animate-spin" /> : "Check"}
                  </button>
                </div>
              </div>
              {gcError && <p className="text-xs text-red-500">{gcError}</p>}
              {gcData && (
                <div className="bg-charcoal/5 border border-stone rounded p-5 space-y-2">
                  <p className="text-sm text-charcoal">Amount: <span className="font-medium">{formatPrice(gcData.amount)}</span></p>
                  <p className="text-sm text-charcoal">Balance: <span className="font-medium">{formatPrice(gcData.balance)}</span></p>
                  <p className="text-xs text-mink">From: {gcData.senderName}</p>
                  {gcData.message && <p className="text-sm text-mink italic">&ldquo;{gcData.message}&rdquo;</p>}
                  {gcData.balance > 0 && (
                    <button
                      onClick={handleRedeem}
                      disabled={redeeming}
                      className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-green-600 text-white py-3 hover:bg-green-700 transition-colors disabled:opacity-50 mt-3"
                    >
                      {redeeming ? <><LoaderCircle size={14} className="animate-spin" /> Redeeming...</> : "Redeem Balance"}
                    </button>
                  )}
                </div>
              )}
              {redeemResult && (
                <p className={`text-xs ${redeemResult.startsWith("Successfully") ? "text-green-600" : "text-red-500"}`}>{redeemResult}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
