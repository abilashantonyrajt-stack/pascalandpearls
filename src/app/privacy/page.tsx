import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Pascal & Pearls",
  description: "Pascal & Pearls privacy policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="bg-ivory min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-[0.15em] text-charcoal mb-2">Privacy Policy</h1>
        <p className="text-xs text-mink tracking-wider mb-8">Last updated: July 2026</p>

        <div className="space-y-6 text-sm text-charcoal/70 leading-relaxed">
          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">1. Information We Collect</h2>
            <p>When you make a purchase or attempt to make a purchase through our website, we collect the following information:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your name, email address, phone number, and shipping address</li>
              <li>Order details including items purchased and payment method</li>
              <li>Device information such as browser type and IP address</li>
              <li>Cookies and usage data for site analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your order status</li>
              <li>Send marketing emails if you have opted in (you may opt out at any time)</li>
              <li>Improve our website and customer experience</li>
              <li>Prevent fraud and ensure secure transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">3. Payment Information</h2>
            <p>We do not store your payment card details. All payment transactions are processed through secure third-party payment gateways (UPI, Cash on Delivery). Your payment information is encrypted and handled directly by the payment provider.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">4. Data Sharing</h2>
            <p>We do not sell or rent your personal information to third parties. We may share your data with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Shipping partners to deliver your orders</li>
              <li>Email service providers to send transactional and marketing emails</li>
              <li>Analytics providers to help us improve our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">5. Cookies</h2>
            <p>We use cookies and similar tracking technologies to enhance your browsing experience. Cookies help us remember your preferences, understand how you use our site, and show you relevant products. You can control cookie settings through your browser.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">6. Data Retention</h2>
            <p>We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Order records are kept for accounting and tax purposes.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Lodge a complaint with relevant data protection authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">8. Contact</h2>
            <p>If you have any questions about this privacy policy or your data, please contact us at <a href="mailto:antonyabilash51@gmail.com" className="text-mink hover:underline">antonyabilash51@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
