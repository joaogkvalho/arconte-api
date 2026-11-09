import {
  getPopularGames,
  searchGames,
  getGameById,
} from "../services/igdb.service";
import type { Env } from "../types/env";
import { jsonResponse } from "../utils/response";

export async function handleGamesRoute(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("search")?.trim();

  const offsetParam = url.searchParams.get("offset");
  const offset = offsetParam === null ? 0 : Number(offsetParam);

  if (offsetParam !== null && !/^\d+$/.test(offsetParam)) {
    return jsonResponse(
      { error: "Offset must be a non-negative integer" },
      400,
    );
  }

  if (!Number.isSafeInteger(offset)) {
    return jsonResponse(
      { error: "Offset must be a non-negative integer" },
      400,
    );
  }

  if (searchTerm !== undefined && searchTerm !== null) {
    if (searchTerm.length < 2 || searchTerm.length > 100) {
      return jsonResponse(
        { error: "Search must contain between 2 and 100 characters" },
        400,
      );
    }
  }

  try {
    const games = searchTerm
      ? await searchGames(env, searchTerm, offset)
      : await getPopularGames(env, offset);

    const cacheSeconds = searchTerm ? 300 : 900;

    return jsonResponse(games, 200, cacheSeconds);
  } catch (error) {
    console.error("Error fetching games:", error);

    return jsonResponse({ error: "Unable to fetch games" }, 502);
  }
}

export async function handleGameDetailsRoute(
  request: Request,
  env: Env,
  gameId: number,
): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const game = await getGameById(env, gameId);

    if (!game) {
      return jsonResponse({ error: "Game not found" }, 404);
    }

    return jsonResponse(game, 200, 3600);
  } catch (error) {
    console.error("Error fetching game details:", error);

    return jsonResponse({ error: "Unable to fetch game details" }, 502);
  }
}
