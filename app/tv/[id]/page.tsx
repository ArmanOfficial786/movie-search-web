import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiError, getTvShow } from "~/lib/api";

type TvPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function TvPage({ params }: TvPageProps) {
  const { id } = await params;
  const showId = Number(id);

  if (!Number.isInteger(showId) || showId < 1) {
    notFound();
  }

  let show;
  try {
    show = await getTvShow(showId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const firstAirDate = show.releaseDate || null;

  return (
    <main className="min-h-screen">
      <section className="relative min-h-[32rem] overflow-hidden border-b border-border bg-surface">
        {show.backdropPath && (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${show.backdropPath}`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-background/75" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-12">
          <Link
            href="/?type=tv"
            className="w-fit text-sm font-medium text-brand-400 hover:text-brand-100"
          >
            ← Back to TV shows
          </Link>

          <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-end">
            <div className="relative aspect-[2/3] w-full max-w-[220px] overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
              {show.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${show.posterPath}`}
                  alt={show.title}
                  fill
                  priority
                  sizes="220px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  No poster
                </div>
              )}
            </div>

            <div className="flex max-w-3xl flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                {firstAirDate && <span>First aired {firstAirDate}</span>}
                <span
                  aria-label={`Rated ${show.voteAverage.toFixed(1)} out of 10`}
                >
                  ★ {show.voteAverage.toFixed(1)}
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {show.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted">
                {show.overview || "No overview is available for this TV show."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <aside className="h-fit max-w-sm rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold tracking-wider text-muted uppercase">
            TV show details
          </h2>
          <dl className="mt-4 flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-muted">First air date</dt>
              <dd className="mt-1 text-foreground">
                {firstAirDate || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">TMDB rating</dt>
              <dd className="mt-1 text-foreground">
                {show.voteAverage.toFixed(1)} / 10
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
