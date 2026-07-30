import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Pascal & Pearls",
  description: "Pascal & Pearls terms of service — conditions governing your use of our website and purchases.",
};

export default function TermsPage() {
  return (
    <main className="bg-ivory min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-light tracking-[0.15em] text-charcoal mb-2">Terms of Service</h1>
        <p className="text-xs text-mink tracking-wider mb-8">Last updated: July 2026</p>

        <div className="space-y-6 text-sm text-charcoal/70 leading-relaxed">
          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using the Pascal & Pearls website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">2. Products & Pricing</h2>
            <p>All product descriptions, images, and prices are subject to change without notice. We strive for accuracy but do not guarantee that product descriptions or colors are error-free. Prices are listed in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">3. Orders & Payment</h2>
            <p>By placing an order, you agree to provide accurate and complete information. We reserve the right to refuse or cancel any order. Payment methods accepted include UPI and Cash on Delivery. Orders are confirmed once payment is verified.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">4. Shipping & Delivery</h2>
            <p>Estimated delivery times are 3-5 business days and may vary based on location. We are not responsible for delays caused by shipping carriers or unforeseen circumstances. Risk of loss passes to you upon delivery.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">5. Cancellations & Returns</h2>
            <p>Orders may be cancelled within 30 minutes of placement as long as the fulfillment status is still pending. For any issues with your order, please contact us at <a href="mailto:antonyabilash51@gmail.com" className="text-mink hover:underline">antonyabilash51@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">6. Intellectual Property</h2>
            <p>All content on this website — including text, images, designs, and logos — is the property of Pascal & Pearls and may not be reproduced without our written consent.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">7. Limitation of Liability</h2>
            <p>Pascal & Pearls shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability is limited to the amount paid for the product in question.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">8. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Changes will be posted on this page with an updated effective date. Continued use of the website constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-base tracking-[0.1em] text-charcoal mb-2">9. Contact</h2>
            <p>For questions about these terms, please reach out to <a href="mailto:antonyabilash51@gmail.com" className="text-mink hover:underline">antonyabilash51@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
