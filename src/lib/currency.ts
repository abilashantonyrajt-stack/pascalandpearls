export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

export const CURRENCIES: Record<string, Currency> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 0.012 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.011 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.0095 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 0.044 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 0.016 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 0.016 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 0.018 },
};

export function convertPrice(priceInr: number, toCurrency: string): number {
  const currency = CURRENCIES[toCurrency];
  if (!currency) return priceInr;
  return Math.round(priceInr * currency.rate * 100) / 100;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const c = CURRENCIES[currencyCode];
  if (!c) return `₹${amount}`;
  return `${c.symbol}${amount.toFixed(2)}`;
}
