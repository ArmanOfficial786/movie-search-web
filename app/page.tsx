import { Navbar } from "~/components/Navbar";
import { SearchBar } from "~/components/SearchBar";
import { TrendingGrid } from "~/components/TrendingGrid";
import { getTrendingMovies, getTrendingTvShows } from "~/lib/api";
import type { MediaType } from "~/types/movie";


export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const mediaType: MediaType = params.type === "tv" ? "tv" : "movie";
  const isTv = mediaType === "tv";
  const trendingMovies = isTv
    ? await getTrendingTvShows()
    : await getTrendingMovies();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <Navbar mediaType={mediaType} />
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          {isTv ? "TV Search" : "Movie Search Case"}
        </h1>
        <SearchBar mediaType={mediaType} />
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-foreground">
          {isTv ? "TV shows on the air" : "Trending this week"}
        </h2>
        <TrendingGrid movies={trendingMovies} mediaType={mediaType} />
      </section>
    </main>
  );
}
