export interface Movie {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
}

export interface MovieTrailer {
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MovieDetails extends Movie {
  trailers: MovieTrailer[] | null;
}

export type MediaType = "movie" | "tv";

export interface MovieSearchResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Movie[];
}
