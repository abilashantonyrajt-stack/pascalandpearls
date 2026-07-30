"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LoaderCircle, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  async function handleSendOtp() {
    if (!name.trim()) { setError("Please enter your name"); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep("otp");
      setResendTimer(60);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(name.trim(), email);
      router.push("/");
    } catch {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-ivory min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="glass-strong p-8">
          <h1 className="text-sm tracking-widest uppercase text-charcoal mb-1 text-center">Sign In</h1>
          <p className="text-xs text-mink mb-6 text-center">Verify your email to continue</p>

          {error && <p className="text-xs text-red-500 mb-4 text-center">{error}</p>}

          {step === "form" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs tracking-wider text-mink mb-1 block">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs tracking-wider text-mink mb-1 block">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors" placeholder="your@email.com" />
              </div>
              <button onClick={handleSendOtp} disabled={loading} className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <><LoaderCircle size={16} className="animate-spin" /> Sending OTP...</> : "Send OTP via Email"}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-xs text-mink text-center">OTP sent to <span className="text-charcoal font-medium">{email}</span></p>
              <div>
                <label className="text-xs tracking-wider text-mink mb-1 block">Enter OTP</label>
                <input type="text" value={otp} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setOtp(v); }} className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none transition-colors text-center tracking-[0.5em]" placeholder="000000" maxLength={6} />
              </div>
              <button onClick={handleVerify} disabled={otp.length !== 6 || loading} className="w-full flex items-center justify-center gap-2 text-xs tracking-widest uppercase bg-charcoal text-ivory py-4 hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <><LoaderCircle size={16} className="animate-spin" /> Verifying...</> : "Verify & Sign In"}
              </button>
              <div className="flex items-center justify-center gap-3 text-xs">
                {resendTimer > 0 ? (
                  <span className="text-mink">Resend in {resendTimer}s</span>
                ) : (
                  <button onClick={handleSendOtp} disabled={loading} className="text-gold-dark hover:text-charcoal transition-colors uppercase tracking-widest">Resend OTP</button>
                )}
              </div>
              <button onClick={() => { setStep("form"); setOtp(""); setError(""); }} className="w-full text-xs tracking-widest uppercase text-mink hover:text-charcoal transition-colors py-2">Change email</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
