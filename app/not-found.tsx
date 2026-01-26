import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/Footer";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-8">
            <Logo size="sm" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <span className="text-8xl font-bold text-muted-foreground/20">404</span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Page not found
            </h1>

            <p className="text-muted-foreground mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or no longer exists.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Browse Events
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/contact">
                  <Search className="h-4 w-4 mr-2" />
                  Contact Us
                </Link>
              </Button>
            </div>

            <div className="mt-12">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
