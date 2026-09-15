import { NextResponse } from "next/server";

import { ApiError, searchMovies, searchTvShows } from "~/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const mediaType = searchParams.get("type") === "tv" ? "tv" : "movie";
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  if (!query) {
    return NextResponse.json(
      { message: "A search query is required." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(
      await (mediaType === "tv"
        ? searchTvShows(query, page)
        : searchMovies(query, page)),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: "The movie search is currently unavailable." },
      { status: 502 },
    );
  }
}
