import Link from "next/link";

import type { MediaType } from "~/types/movie";

interface NavbarProps {
  mediaType: MediaType;
}

export function Navbar({ mediaType }: NavbarProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="flex items-center justify-between border-b border-border pb-4"
    >
      <Link
        href="/"
        className="text-sm font-semibold tracking-wide text-foreground"
      >
        Movie Search Case
      </Link>
      <div className="flex items-center gap-1" role="tablist">
        <Link
          href="/"
          role="tab"
          aria-selected={mediaType === "movie"}
          className={`rounded px-3 py-1.5 text-sm transition-colors ${
            mediaType === "movie"
              ? "bg-brand-600 text-white"
              : "text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          Movies
        </Link>
        <Link
          href="/?type=tv"
          role="tab"
          aria-selected={mediaType === "tv"}
          className={`rounded px-3 py-1.5 text-sm transition-colors ${
            mediaType === "tv"
              ? "bg-brand-600 text-white"
              : "text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          TV
        </Link>
      </div>
    </nav>
  );
}
