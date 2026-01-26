import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - GoStride",
  description: "Privacy Policy for GoStride - Find your next finish line in New Zealand",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Introduction</h2>
              <p>
                GoStride (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the GoStride website. This page informs you of our policies regarding the collection, use, and disclosure of personal information when you use our website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
              <p>
                We collect information to provide and improve our service to you. The types of information we may collect include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> We may collect information about how the website is accessed and used, including your browser type, pages visited, time spent on pages, and other diagnostic data.</li>
                <li><strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to track activity on our website and store certain information.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Advertising and Cookies</h2>
              <p>
                We use third-party advertising companies to serve ads when you visit our website. These companies may use cookies to serve ads based on your prior visits to this website or other websites on the Internet.
              </p>
              <p>
                <strong>Google AdSense:</strong> Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.
              </p>
              <p>
                You may opt out of personalised advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline hover:no-underline"
                >
                  Google Ads Settings
                </a>
                . Alternatively, you can opt out of third-party vendor cookies for personalised advertising by visiting{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline hover:no-underline"
                >
                  www.aboutads.info
                </a>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">How We Use Cookies</h2>
              <p>
                Cookies are small files stored on your device. We use cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
                <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements and track ad campaign performance.</li>
              </ul>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Third-Party Services</h2>
              <p>
                Our website may contain links to third-party websites or services that are not operated by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Data Security</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Children&apos;s Privacy</h2>
              <p>
                Our website is not intended for children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our website.
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
