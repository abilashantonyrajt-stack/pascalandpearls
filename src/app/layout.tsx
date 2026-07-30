import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SiteContentProvider } from "@/context/SiteContentContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { CurrencyProvider } from "@/context/CurrencyContext";
import ClientLayout from "@/components/ClientLayout";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pascal-and-pearls.vercel.app"),
  title: "Pascal & Pearls | Artisan Handcrafted Jewelry",
  description:
    "Discover exquisite handcrafted beaded jewelry and artificial pearl sets. Pascal & Pearls — timeless elegance, handmade with passion.",
  keywords: [
    "handcrafted jewelry", "artisan pearls", "beaded jewelry", "artificial pearl sets",
    "Pascal and Pearls", "handmade jewelry", "jewelry for women", "pearl necklace",
    "bridal jewelry set", "traditional Indian jewelry", "gift for her",
  ],
  openGraph: {
    title: "Pascal & Pearls | Artisan Handcrafted Jewelry",
    description:
      "Discover exquisite handcrafted beaded jewelry and artificial pearl sets. Pascal & Pearls — timeless elegance, handmade with passion.",
    url: "https://pascal-and-pearls.vercel.app",
    siteName: "Pascal & Pearls",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pascal & Pearls | Artisan Handcrafted Jewelry",
    description:
      "Discover exquisite handcrafted beaded jewelry and artificial pearl sets. Pascal & Pearls — timeless elegance, handmade with passion.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "msvalidate.01": "340E206683AA698BFB6EDF908263E60B",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                      <CurrencyProvider>
                      <SiteContentProvider>
                    <ClientLayout>{children}</ClientLayout>
                    <CookieConsent />
                  </SiteContentProvider>
                  </CurrencyProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
