import "server-only";

import type { Movie, MovieDetails, MovieSearchResponse } from "~/types/movie";

interface TvShowResponse {
  id: number;
  name: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  firstAirDate: string | null;
}

interface TvSearchResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: TvShowResponse[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and point it at the running API.",
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(
      `Request to ${path} failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/** TMDB-backed trending movies fetch. */
export function getTrendingMovies(): Promise<Movie[]> {
  return apiFetch<Movie[] | MovieSearchResponse>("/movies/trending", {
    cache: "no-store",
  }).then((response) =>
    Array.isArray(response) ? response : response.results,
  );
}

export function getTrendingTvShows(): Promise<Movie[]> {
  return apiFetch<TvSearchResponse>("/tv/trending", {
    cache: "no-store",
  }).then((response) => response.results.map(toMovie));
}

export function searchMovies(
  query: string,
  page: number,
): Promise<MovieSearchResponse> {
  const params = new URLSearchParams({ query, page: String(page) });
  return apiFetch<MovieSearchResponse>(`/movies/search?${params}`, {
    cache: "no-store",
  });
}

export function searchTvShows(
  query: string,
  page: number,
): Promise<MovieSearchResponse> {
  const params = new URLSearchParams({ query, page: String(page) });
  return apiFetch<TvSearchResponse>(`/tv/search?${params}`, {
    cache: "no-store",
  }).then((response) => ({
    ...response,
    results: response.results.map(toMovie),
  }));
}

export function getMovie(id: number): Promise<MovieDetails> {
  return apiFetch<MovieDetails>(`/movies/${id}`, {
    cache: "no-store",
  });
}

export function getTvShow(id: number): Promise<MovieDetails> {
  return apiFetch<TvShowResponse>(`/tv/${id}`, {
    cache: "no-store",
  }).then((show) => ({ ...toMovie(show), trailers: null }));
}

function toMovie(show: TvShowResponse): Movie {
  return {
    id: show.id,
    title: show.name,
    overview: show.overview,
    posterPath: show.posterPath,
    backdropPath: show.backdropPath,
    voteAverage: show.voteAverage,
    releaseDate: show.firstAirDate,
  };
}
