import { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { Target, Users, MapPin, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - GoStride",
  description: "Learn about GoStride - New Zealand's event discovery platform for runners, cyclists, and triathletes.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">About GoStride</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Helping New Zealand&apos;s running, cycling, and triathlon community find their next finish line.
          </p>

          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Our Mission</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                GoStride was created with a simple goal: to make it easier for athletes across New Zealand to discover events that match their goals, abilities, and interests.
              </p>
              <p>
                Whether you&apos;re training for your first 5K, chasing a marathon personal best, tackling a multi-day cycling adventure, or preparing for an Ironman, we believe finding the right event shouldn&apos;t be hard. That&apos;s why we&apos;ve built a comprehensive platform that brings together running, cycling, and triathlon events from across the country in one place.
              </p>
            </div>
          </section>

          {/* What We Do Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-foreground mb-6">What We Do</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-lg bg-[var(--event-running)]/15 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-[var(--event-running)]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Curated Event Listings</h3>
                <p className="text-sm text-muted-foreground">
                  We gather and verify event information from across New Zealand, presenting it in a clear, searchable format so you can find exactly what you&apos;re looking for.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-lg bg-[var(--event-cycling)]/15 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-[var(--event-cycling)]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Local Focus</h3>
                <p className="text-sm text-muted-foreground">
                  From community fun runs to major national events, we cover events in every region of New Zealand, helping you find races close to home or plan destination events.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-lg bg-[var(--event-triathlon)]/15 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[var(--event-triathlon)]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">For All Levels</h3>
                <p className="text-sm text-muted-foreground">
                  Whether you&apos;re a beginner looking for your first event or an experienced athlete seeking your next challenge, we have events for every fitness level.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/50">
                <div className="w-12 h-12 rounded-lg bg-primary/15 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Community Driven</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;re passionate about supporting New Zealand&apos;s endurance sports community and helping event organisers connect with participants.
                </p>
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Our Story</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                GoStride started from a personal frustration: finding events in New Zealand meant searching across dozens of different websites, Facebook pages, and word-of-mouth recommendations. Important events were easy to miss, and comparing options was time-consuming.
              </p>
              <p>
                We built GoStride to solve this problem - creating a single, comprehensive resource for the New Zealand endurance sports community. Our platform brings together events from organisers large and small, making it simple to discover new challenges and plan your racing calendar.
              </p>
              <p>
                Based in New Zealand, we understand the unique landscape of our local events scene - from iconic coastal runs to challenging mountain bike races, from community triathlons to world-class ultra events.
              </p>
            </div>
          </section>

          {/* Event Organisers Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-foreground mb-6">For Event Organisers</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                Are you an event organiser? We&apos;d love to feature your event on GoStride. We help connect your event with motivated participants who are actively searching for their next challenge.
              </p>
              <p>
                <Link href="/contact" className="text-foreground underline hover:no-underline">
                  Get in touch
                </Link>
                {" "}to have your event listed or to update existing event information.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12 p-8 rounded-xl border border-border bg-card/50">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">
              Have questions, feedback, or suggestions? We&apos;d love to hear from you. Whether you&apos;ve spotted an error, want to suggest an event, or just want to say hello, we&apos;re here to help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </section>

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
