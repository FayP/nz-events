import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use - GoStride",
  description: "Terms of Use for GoStride - Find your next finish line in New Zealand",
};

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Use</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Acceptance of Terms</h2>
              <p>
                By accessing and using GoStride (&quot;the Website&quot;), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Description of Service</h2>
              <p>
                GoStride is an event discovery platform that aggregates information about running, cycling, and triathlon events in New Zealand. We provide event listings, dates, locations, and links to official event websites. We are not event organisers and do not sell tickets or registrations directly.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Use of the Website</h2>
              <p>You agree to use the Website only for lawful purposes and in a way that does not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Infringe the rights of others or restrict their use of the Website</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Transmit any harmful, threatening, or offensive material</li>
                <li>Attempt to gain unauthorised access to any part of the Website</li>
                <li>Use automated systems to scrape or extract data without permission</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Event Information</h2>
              <p>
                Event information displayed on GoStride is sourced from publicly available sources and event organisers. While we strive to keep information accurate and up-to-date:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Event details (dates, times, locations, prices) may change without notice</li>
                <li>Events may be cancelled or postponed by organisers</li>
                <li>You should always verify details on the official event website before registering or attending</li>
                <li>We are not responsible for any inaccuracies in event information</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Intellectual Property</h2>
              <p>
                The content, design, and functionality of the Website are owned by GoStride and are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.
              </p>
              <p>
                Event names, logos, and related content remain the property of their respective owners and are used for informational purposes only.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Third-Party Links</h2>
              <p>
                The Website contains links to third-party websites, including event registration pages and organiser websites. These links are provided for your convenience. We have no control over the content, privacy policies, or practices of third-party websites and accept no responsibility for them.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, GoStride shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of, or inability to use, the Website. This includes but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reliance on event information that proves to be inaccurate</li>
                <li>Missed events due to incorrect dates or times</li>
                <li>Financial losses from event cancellations</li>
                <li>Any issues arising from third-party websites linked from our platform</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Disclaimer of Warranties</h2>
              <p>
                The Website is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express or implied. We do not guarantee that the Website will be uninterrupted, error-free, or free of viruses or other harmful components.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless GoStride, its owners, and affiliates from any claims, damages, or expenses arising from your use of the Website or violation of these Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the Website. Your continued use of the Website after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Governing Law</h2>
              <p>
                These Terms of Use are governed by the laws of New Zealand. Any disputes arising from these Terms or your use of the Website shall be subject to the exclusive jurisdiction of the courts of New Zealand.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Contact</h2>
              <p>
                If you have any questions about these Terms of Use, please{" "}
                <Link href="/contact" className="text-foreground underline hover:no-underline">
                  contact us
                </Link>
                .
              </p>
            </section>
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back to events
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
