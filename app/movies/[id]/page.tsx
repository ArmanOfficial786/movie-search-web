import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiError, getMovie } from "~/lib/api";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isInteger(movieId) || movieId < 1) {
    notFound();
  }

  let movie;
  try {
    movie = await getMovie(movieId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;
  const trailer = movie.trailers?.find(
    (candidate) => candidate.site === "YouTube",
  );

  return (
    <main className="min-h-screen">
      <section className="relative min-h-[32rem] overflow-hidden border-b border-border bg-surface">
        {movie.backdropPath && (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${movie.backdropPath}`}
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
            href="/"
            className="w-fit text-sm font-medium text-brand-400 hover:text-brand-100"
          >
            ← Back to movies
          </Link>

          <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-end">
            <div className="relative aspect-[2/3] w-full max-w-[220px] overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
              {movie.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                  alt={movie.title}
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
                {year && <span>{year}</span>}
                <span
                  aria-label={`Rated ${movie.voteAverage.toFixed(1)} out of 10`}
                >
                  ★ {movie.voteAverage.toFixed(1)}
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {movie.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted">
                {movie.overview || "No overview is available for this movie."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Trailer</h2>
          {trailer ? (
            <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-border bg-surface">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              No trailer is available for this movie.
            </p>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold tracking-wider text-muted uppercase">
            Movie details
          </h2>
          <dl className="mt-4 flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-muted">Release date</dt>
              <dd className="mt-1 text-foreground">
                {movie.releaseDate || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">TMDB rating</dt>
              <dd className="mt-1 text-foreground">
                {movie.voteAverage.toFixed(1)} / 10
              </dd>
            </div>
            <div>
              <dt className="text-muted">Movie ID</dt>
              <dd className="mt-1 text-foreground">{movie.id}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
