import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Disclaimer - GoStride",
  description: "Disclaimer for GoStride - Find your next finish line in New Zealand",
};

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-8">Disclaimer</h1>

          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Event Information Disclaimer</h2>
              <p>
                GoStride is an event aggregation and discovery service. We compile information about running, cycling, and triathlon events from publicly available sources for your convenience.
              </p>
              <p className="font-medium text-foreground">
                We are not event organisers and have no affiliation with the events listed on this website unless explicitly stated.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Accuracy of Information</h2>
              <p>
                While we make every effort to ensure the accuracy of event information, we cannot guarantee that all details are correct, complete, or current. Event information including but not limited to dates, times, locations, distances, prices, and availability may:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Change without notice by the event organiser</li>
                <li>Contain errors or omissions</li>
                <li>Become outdated between our updates</li>
                <li>Differ from official event sources</li>
              </ul>
              <p className="font-medium text-foreground">
                Always verify event details on the official event website before making travel arrangements, registering, or attending any event.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Event Cancellations and Changes</h2>
              <p>
                Events may be cancelled, postponed, or modified by their organisers at any time due to weather, safety concerns, insufficient registrations, or other reasons. GoStride:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Is not responsible for event cancellations or changes</li>
                <li>Cannot provide refunds for any event registrations</li>
                <li>May not be immediately aware of cancellations or changes</li>
                <li>Recommends checking the official event website or contacting the organiser directly for the most current information</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Third-Party Websites</h2>
              <p>
                Our website contains links to external websites operated by event organisers and other third parties. These links are provided for your convenience and reference only. We do not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Control or endorse the content of external websites</li>
                <li>Guarantee the availability or security of external websites</li>
                <li>Accept responsibility for any transactions conducted on external websites</li>
                <li>Verify the legitimacy of external events or organisers</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Health and Safety</h2>
              <p>
                Participation in running, cycling, and triathlon events involves inherent risks. Before participating in any event:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Consult with a medical professional if you have any health concerns</li>
                <li>Ensure you are adequately trained for the event distance and conditions</li>
                <li>Review the event&apos;s safety guidelines and requirements</li>
                <li>Understand and accept the risks associated with the activity</li>
              </ul>
              <p>
                GoStride accepts no responsibility for any injuries, illness, or death resulting from participation in any event listed on this website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">No Endorsement</h2>
              <p>
                The listing of an event on GoStride does not constitute an endorsement or recommendation of that event, its organisers, or any associated products or services. We do not verify the quality, safety standards, or legitimacy of listed events.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by New Zealand law, GoStride, its owners, employees, and affiliates shall not be liable for any loss or damage arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of or reliance on information provided on this website</li>
                <li>Any errors, inaccuracies, or omissions in event information</li>
                <li>Event cancellations, postponements, or changes</li>
                <li>Your interactions with event organisers or third-party websites</li>
                <li>Any personal injury or property damage related to event participation</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
              <p>
                If you notice any inaccurate information or have concerns about an event listing, please{" "}
                <Link href="/contact" className="text-foreground underline hover:no-underline">
                  contact us
                </Link>
                {" "}and we will review it promptly.
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
