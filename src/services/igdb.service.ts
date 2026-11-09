import type { Env } from "../types/env";
import type { Game, GameDetails } from "../types/game";
import { normalizeGameImages } from "../utils/igdb-image";
import { getTwitchAccessToken } from "./twitch.service";

const IGDB_GAMES_URL = "https://api.igdb.com/v4/games";

interface IGDBError {
  message?: string;
}

export async function getPopularGames(env: Env, offset = 0): Promise<Game[]> {
  const accessToken = await getTwitchAccessToken(env);

  const query = `
    fields
      name,
      summary,
      rating,
      first_release_date,
      genres.name,
      platforms.name,
      cover.url;
    where rating != null & cover != null;
    sort rating desc;
    limit 20;
    offset ${offset}; 
    `;

  const response = await fetch(IGDB_GAMES_URL, {
    method: "POST",
    headers: {
      "Client-ID": env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body: query,
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("IGDB request failed:", {
      status: response.status,
      body: errorBody,
    });

    throw new Error(`IGDB request failed: ${response.status}`);
  }

  const games = (await response.json()) as Game[];

  return games.map(normalizeGameImages);
}

export async function searchGames(
  env: Env,
  searchTerm: string,
  offset = 0,
): Promise<Game[]> {
  const accessToken = await getTwitchAccessToken(env);

  const escapedTerm = searchTerm.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const query = `
    search "${escapedTerm}";
    fields
      name,
      summary,
      rating,
      first_release_date,
      genres.name,
      platforms.name,
      cover.url;
    limit 20;
    offset ${offset};
  `;

  const response = await fetch(IGDB_GAMES_URL, {
    method: "POST",
    headers: {
      "Client-ID": env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body: query,
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("IGDB search failed:", {
      status: response.status,
      body: errorBody,
    });

    throw new Error(`IGDB search failed: ${response.status}`);
  }

  const games = (await response.json()) as Game[];

  return games.map(normalizeGameImages);
}

export async function getGameById(
  env: Env,
  gameId: number,
): Promise<GameDetails | null> {
  const accessToken = await getTwitchAccessToken(env);

  const query = `
    fields
      name,
      summary,
      storyline,
      rating,
      total_rating,
      first_release_date,
      genres.name,
      platforms.name,
      cover.url,
      screenshots.url,
      screenshots.width,
      screenshots.height,
      videos.name,
      videos.video_id,
      involved_companies.developer,
      involved_companies.publisher,
      involved_companies.company.name,
      similar_games.name,
      similar_games.cover.url,
      similar_games.rating,
      websites.url,
      websites.category;
    where id = ${gameId};
    limit 1;
  `;

  const response = await fetch(IGDB_GAMES_URL, {
    method: "POST",
    headers: {
      "Client-ID": env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body: query,
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("IGDB game details failed:", {
      status: response.status,
      body: errorBody,
    });

    throw new Error(`IGDB game details failed: ${response.status}`);
  }

  const games = (await response.json()) as GameDetails[];
  const game = games[0];

  return game ? normalizeGameImages(game) : null;
}
