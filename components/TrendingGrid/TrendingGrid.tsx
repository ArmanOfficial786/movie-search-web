import { MovieCard } from "~/components/MovieCard";
import type { MediaType, Movie } from "~/types/movie";

export interface TrendingGridProps {
  movies: Movie[];
  mediaType?: MediaType;
}

export function TrendingGrid({
  movies,
  mediaType = "movie",
}: TrendingGridProps) {
  if (movies.length === 0) {
    return <p className="text-sm text-muted">No trending movies right now.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} mediaType={mediaType} />
      ))}
    </div>
  );
}
