import Link from "next/link";
import Script from "next/script";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <Logo size="sm" />
            <p className="mt-2 text-sm text-muted-foreground">
              Find your next finish line in New Zealand
            </p>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/disclaimer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex justify-center">
            <iframe
              src="https://subscribe-forms.beehiiv.com/b92405ac-8533-4b6b-81cd-1efc937edbb1"
              className="beehiiv-embed"
              data-test-id="beehiiv-embed"
              frameBorder="0"
              scrolling="no"
              style={{
                width: "100%",
                maxWidth: 699,
                height: 339,
                margin: 0,
                borderRadius: 0,
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
            />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} GoStride. All rights reserved.
          </p>
        </div>
      </div>

      <Script
        src="https://subscribe-forms.beehiiv.com/embed.js"
        strategy="lazyOnload"
      />
    </footer>
  );
}
