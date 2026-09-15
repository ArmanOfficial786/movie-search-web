"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MovieCard } from "~/components/MovieCard";
import type { MediaType, MovieSearchResponse } from "~/types/movie";

const SEARCH_TIMEOUT_MS = 15_000;

interface SearchBarProps {
  mediaType?: MediaType;
}

export function SearchBar({ mediaType = "movie" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<MovieSearchResponse | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const resultsRef = useRef<HTMLElement | null>(null);
  const shouldScrollToResults = useRef(false);

  const fetchResults = useCallback(
    async (nextQuery: string, nextPage: number, scrollToResults = false) => {
      shouldScrollToResults.current = scrollToResults;
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      const currentRequestId = ++requestId.current;
      const timeoutId = setTimeout(
        () => controller.abort("timeout"),
        SEARCH_TIMEOUT_MS,
      );

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/search?type=${mediaType}&query=${encodeURIComponent(nextQuery)}&page=${nextPage}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        setSearch((await response.json()) as MovieSearchResponse);
        setSubmittedQuery(nextQuery);
        setPage(nextPage);
      } catch {
        if (controller.signal.aborted) {
          if (
            controller.signal.reason === "timeout" &&
            currentRequestId === requestId.current
          ) {
            setError("The search is taking too long. Please try again.");
          }
          return;
        }

        if (currentRequestId === requestId.current) {
          setError("We couldn’t load search results. Please try again.");
        }
      } finally {
        clearTimeout(timeoutId);
        if (currentRequestId === requestId.current) {
          setIsLoading(false);
        }
      }
    },
    [mediaType],
  );

  useEffect(() => {
    if (!shouldScrollToResults.current || isLoading || !search) {
      return;
    }

    shouldScrollToResults.current = false;
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [isLoading, page, search]);

  useEffect(() => {
    const clearRestoredQuery = () => setQuery("");

    window.addEventListener("pageshow", clearRestoredQuery);
    return () => window.removeEventListener("pageshow", clearRestoredQuery);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    activeRequest.current?.abort();
    const nextQuery = query.trim();

    if (!nextQuery) {
      setSearch(null);
      setSubmittedQuery("");
      setPage(1);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    debounceTimer.current = setTimeout(() => {
      void fetchResults(nextQuery, 1);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      activeRequest.current?.abort();
    };
  }, [fetchResults, query]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();

    if (nextQuery) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      void fetchResults(nextQuery, 1);
    }
  }

  const totalPages = search?.totalPages ?? 0;
  const firstVisiblePage = Math.floor((page - 1) / 10) * 10 + 1;
  const lastVisiblePage = Math.min(firstVisiblePage + 9, totalPages);
  const pageNumbers = Array.from(
    { length: lastVisiblePage - firstVisiblePage + 1 },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        aria-label={`Search ${mediaType === "tv" ? "TV shows" : "movies"}`}
        autoComplete="off"
        className="flex w-full max-w-md gap-2"
      >
        <label htmlFor="movie-search" className="sr-only">
          Search for a {mediaType === "tv" ? "TV show" : "movie"}
        </label>
        <input
          id="movie-search"
          type="search"
          name="query"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-controls="search-results"
          aria-busy={isLoading}
          placeholder={`Search for a ${mediaType === "tv" ? "TV show" : "movie"}…`}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
        >
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {isLoading && (
        <section
          role="status"
          aria-live="polite"
          aria-label="Loading search results"
          className="flex flex-col gap-4"
        >
          <p className="text-sm text-muted">Loading results…</p>
          <div
            aria-hidden="true"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={index}
                className="aspect-[2/3] w-full animate-pulse rounded-lg bg-surface"
              />
            ))}
          </div>
        </section>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {search && !isLoading && (
        <section
          id="search-results"
          ref={resultsRef}
          aria-live="polite"
          className="flex scroll-mt-6 flex-col gap-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-medium text-foreground">
              Search results for “{submittedQuery}”
            </h2>
            <span className="text-sm text-muted">
              {search.totalResults} result{search.totalResults === 1 ? "" : "s"}
            </span>
          </div>

          {search.results.length === 0 ? (
            <p role="status" className="text-sm text-muted">
              No {mediaType === "tv" ? "TV shows" : "movies"} matched your
              search.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {search.results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} mediaType={mediaType} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav
              aria-label="Search results pages"
              className="flex flex-wrap items-center gap-2 border border-border bg-surface p-2"
            >
              <button
                type="button"
                disabled={page === 1 || isLoading}
                onClick={() =>
                  void fetchResults(submittedQuery, page - 1, true)
                }
                className="rounded border border-border px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              {firstVisiblePage > 1 && (
                <span
                  aria-label={`Pages before ${firstVisiblePage}`}
                  className="px-1 text-sm text-muted"
                >
                  …
                </span>
              )}
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() =>
                    void fetchResults(submittedQuery, pageNumber, true)
                  }
                  className={`min-w-10 rounded border px-3 py-2 text-sm ${
                    pageNumber === page
                      ? "border-brand-500 bg-brand-600 text-white"
                      : "border-border text-foreground hover:bg-surface-hover"
                  } focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none`}
                >
                  {pageNumber}
                </button>
              ))}
              {lastVisiblePage < totalPages && (
                <span
                  aria-label={`Pages after ${lastVisiblePage}`}
                  className="px-1 text-sm text-muted"
                >
                  …
                </span>
              )}
              <button
                type="button"
                disabled={page === totalPages || isLoading}
                onClick={() =>
                  void fetchResults(submittedQuery, page + 1, true)
                }
                className="rounded border border-border px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
