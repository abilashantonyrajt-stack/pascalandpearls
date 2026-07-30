"use client";

import { X } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";

const ringSizes = [
  { us: "4", diameter: "14.8", circumference: "46.5" },
  { us: "4.5", diameter: "15.2", circumference: "47.8" },
  { us: "5", diameter: "15.6", circumference: "49.0" },
  { us: "5.5", diameter: "16.0", circumference: "50.3" },
  { us: "6", diameter: "16.4", circumference: "51.5" },
  { us: "6.5", diameter: "16.8", circumference: "52.8" },
  { us: "7", diameter: "17.2", circumference: "54.0" },
  { us: "7.5", diameter: "17.6", circumference: "55.3" },
  { us: "8", diameter: "18.0", circumference: "56.5" },
  { us: "8.5", diameter: "18.4", circumference: "57.8" },
  { us: "9", diameter: "18.8", circumference: "59.0" },
  { us: "9.5", diameter: "19.2", circumference: "60.3" },
  { us: "10", diameter: "19.6", circumference: "61.5" },
];

const braceletSizes = [
  { size: "XS", cm: "14 – 15" },
  { size: "S", cm: "15 – 16" },
  { size: "M", cm: "16 – 17" },
  { size: "L", cm: "17 – 18" },
  { size: "XL", cm: "18 – 19" },
];

export default function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative glass-strong w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-light text-charcoal">{t("sizeGuide.title")}</h2>
          <button onClick={onClose} className="p-1 text-mink hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-mink mb-4">{t("sizeGuide.ring")}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-stone text-xs tracking-widest uppercase text-mink">
                  <th className="pb-2 font-normal">{t("sizeGuide.ringUS")}</th>
                  <th className="pb-2 font-normal">{t("sizeGuide.ringDiameter")}</th>
                  <th className="pb-2 font-normal">{t("sizeGuide.ringCircumference")}</th>
                </tr>
              </thead>
              <tbody>
                {ringSizes.map((row) => (
                  <tr key={row.us} className="border-b border-stone/50 last:border-0">
                    <td className="py-2 text-charcoal">{row.us}</td>
                    <td className="py-2 text-charcoal">{row.diameter}</td>
                    <td className="py-2 text-charcoal">{row.circumference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase text-mink mb-4">{t("sizeGuide.bracelet")}</p>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-stone text-xs tracking-widest uppercase text-mink">
                <th className="pb-2 font-normal">Size</th>
                <th className="pb-2 font-normal">cm</th>
              </tr>
            </thead>
            <tbody>
              {braceletSizes.map((row) => (
                <tr key={row.size} className="border-b border-stone/50 last:border-0">
                  <td className="py-2 text-charcoal">{row.size}</td>
                  <td className="py-2 text-charcoal">{row.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
