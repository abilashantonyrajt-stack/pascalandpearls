"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { CURRENCIES, convertPrice, formatCurrency } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (code: string) => void;
  convert: (amountInr: number) => number;
  format: (amountInr: number) => string;
  available: Currency[];
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState("INR");

  useEffect(() => {
    const saved = localStorage.getItem("pnp_currency") || "INR";
    setCode(saved);
  }, []);

  const setCurrency = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem("pnp_currency", newCode);
  };

  const currency = CURRENCIES[code] || CURRENCIES["INR"];
  const available = Object.values(CURRENCIES);

  const convert = (amountInr: number) => convertPrice(amountInr, code);
  const format = (amountInr: number) => formatCurrency(convertPrice(amountInr, code), code);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, available }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
