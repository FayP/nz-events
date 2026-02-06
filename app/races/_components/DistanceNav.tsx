import Link from "next/link";
import { cn } from "@/lib/utils";

interface DistanceNavProps {
  /** The currently active distance page */
  current: "5k" | "10k" | "half-marathon" | "marathon" | "ultra";
}

const DISTANCES = [
  { key: "5k", label: "5K", href: "/races/5k" },
  { key: "10k", label: "10K", href: "/races/10k" },
  { key: "half-marathon", label: "Half Marathon", href: "/races/half-marathons" },
  { key: "marathon", label: "Marathon", href: "/races/marathons" },
  { key: "ultra", label: "Ultra", href: "/races/ultra-marathons" },
] as const;

export function DistanceNav({ current }: DistanceNavProps) {
  return (
    <nav aria-label="Browse by distance" className="shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-1">Distance:</span>
        {DISTANCES.map((distance) => {
          const isActive = distance.key === current;
          return (
            <Link
              key={distance.key}
              href={distance.href}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "bg-transparent border border-border text-foreground hover:bg-muted/50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {distance.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
