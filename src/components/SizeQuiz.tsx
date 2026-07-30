"use client";

import { useState } from "react";
import { Ruler, ArrowLeft, ArrowRight, Check, X } from "lucide-react";

const sizeChart: { mm: number; us: string }[] = [
  { mm: 14.0, us: "4" },
  { mm: 14.4, us: "4.5" },
  { mm: 14.8, us: "5" },
  { mm: 15.2, us: "5.5" },
  { mm: 15.6, us: "6" },
  { mm: 16.0, us: "6.5" },
  { mm: 16.4, us: "7" },
  { mm: 16.8, us: "7.5" },
  { mm: 17.2, us: "8" },
  { mm: 17.6, us: "8.5" },
  { mm: 18.0, us: "9" },
  { mm: 18.4, us: "9.5" },
  { mm: 18.8, us: "10" },
];

function findClosestSize(mm: number): string {
  let closest = sizeChart[0];
  let minDiff = Math.abs(mm - closest.mm);
  for (const s of sizeChart) {
    const diff = Math.abs(mm - s.mm);
    if (diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }
  return closest.us;
}

export default function SizeQuiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"ask" | "measure" | "fit" | "result">("ask");
  const [diameter, setDiameter] = useState("");
  const [result, setResult] = useState("");

  if (!open) return null;

  function reset() {
    setStep("ask");
    setDiameter("");
    setResult("");
  }

  function handleDiameterSubmit() {
    const mm = parseFloat(diameter);
    if (isNaN(mm) || mm <= 0) return;
    setResult(`US ${findClosestSize(mm)}`);
    setStep("result");
  }

  function handleFitChoice(choice: string) {
    switch (choice) {
      case "Too loose":
        setResult("US 5.5");
        setStep("result");
        break;
      case "Too tight":
        setResult("US 6.5");
        setStep("result");
        break;
      case "Perfect":
        setStep("measure");
        break;
      case "Don't have one":
        setResult("US 6 (Average)");
        setStep("result");
        break;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); reset(); } }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative glass-strong w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Ruler size={18} className="text-gold-dark" />
            <h2 className="text-lg font-light text-charcoal">Size Quiz</h2>
          </div>
          <button onClick={() => { onClose(); reset(); }} className="p-1 text-mink hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === "ask" && (
          <div>
            <p className="text-sm text-mink mb-6">Do you have an existing ring to measure?</p>
            <div className="flex gap-3">
              <button onClick={() => setStep("measure")} className="flex-1 text-xs tracking-widest uppercase bg-charcoal text-ivory py-3 hover:bg-charcoal-deep transition-colors">Yes</button>
              <button onClick={() => setStep("fit")} className="flex-1 text-xs tracking-widest uppercase bg-charcoal text-ivory py-3 hover:bg-charcoal-deep transition-colors">No</button>
            </div>
          </div>
        )}

        {step === "measure" && (
          <div>
            <p className="text-sm text-mink mb-4">Measure the inner diameter of your ring in mm</p>
            <input
              type="number"
              step="0.1"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="e.g. 16.4"
              className="w-full glass-input px-4 py-3 text-sm text-charcoal focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setStep("ask")} className="flex items-center justify-center gap-1 text-xs tracking-widest uppercase border border-stone text-mink px-4 py-3 hover:border-charcoal hover:text-charcoal transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={handleDiameterSubmit} disabled={!diameter} className="flex-1 flex items-center justify-center gap-1 text-xs tracking-widest uppercase bg-charcoal text-ivory py-3 hover:bg-charcoal-deep transition-colors disabled:opacity-40">
                Check Size <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === "fit" && (
          <div>
            <p className="text-sm text-mink mb-4">Choose your current ring fit</p>
            <div className="space-y-2">
              {["Too loose", "Perfect", "Too tight", "Don't have one"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleFitChoice(opt)}
                  className="w-full text-left text-sm text-charcoal glass-card px-4 py-3 hover:bg-charcoal/5 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setStep("ask")} className="mt-4 flex items-center gap-1 text-xs tracking-widest uppercase border border-stone text-mink px-4 py-3 hover:border-charcoal hover:text-charcoal transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        )}

        {step === "result" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <p className="text-sm text-mink mb-1">Recommended Size</p>
            <p className="text-2xl font-medium text-charcoal mb-6">{result}</p>
            <div className="flex gap-3">
              <button onClick={() => reset()} className="flex-1 text-xs tracking-widest uppercase border border-stone text-mink px-4 py-3 hover:border-charcoal hover:text-charcoal transition-colors">Retake</button>
              <button onClick={() => { onClose(); reset(); }} className="flex-1 text-xs tracking-widest uppercase bg-charcoal text-ivory py-3 hover:bg-charcoal-deep transition-colors">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
