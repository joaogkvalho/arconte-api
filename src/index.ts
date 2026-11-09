import type { Env } from "./types/env";
import {
  handleGamesRoute,
  handleGameDetailsRoute,
} from "./routes/games.routes";
import { jsonResponse } from "./utils/response";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return jsonResponse({
        status: "ok",
        service: "arconte-api",
      });
    }

    const gameDetailsMatch = url.pathname.match(/^\/games\/(\d+)$/);

    if (gameDetailsMatch) {
      const gameId = Number(gameDetailsMatch[1]);

      if (!Number.isSafeInteger(gameId) || gameId <= 0) {
        return jsonResponse({ error: "Invalid game ID" }, 400);
      }

      return handleGameDetailsRoute(request, env, gameId);
    }

    if (url.pathname === "/games") {
      return handleGamesRoute(request, env);
    }

    return jsonResponse({ error: "Route not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
