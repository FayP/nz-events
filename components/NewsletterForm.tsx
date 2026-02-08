"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          You&apos;re subscribed!
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks for joining — check your inbox for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm font-medium text-foreground">
        Stay in the loop
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Get upcoming races and events delivered to your inbox.
      </p>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2"
      >
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="max-w-xs"
          disabled={status === "loading"}
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <svg
                className="size-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Subscribing…
            </span>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
