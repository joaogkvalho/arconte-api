import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Env } from "../src/types/env";

import {
  getPopularGames,
  searchGames,
  getGameById,
} from "../src/services/igdb.service";

import {
  handleGamesRoute,
  handleGameDetailsRoute,
} from "../src/routes/games.routes";

vi.mock("../src/services/igdb.service", () => ({
  getPopularGames: vi.fn(),
  searchGames: vi.fn(),
  getGameById: vi.fn(),
}));

const mockEnv: Env = {
  TWITCH_CLIENT_ID: "test-client-id",
  TWITCH_CLIENT_SECRET: "test-client-secret",
};

const mockGame = {
  id: 1,
  name: "Thief II: The Metal Age",
  cover: {
    id: 291911,
    url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co698n.jpg",
  },
};

describe("Games Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /games", () => {
    it("should return popular games with default offset", async () => {
      vi.mocked(getPopularGames).mockResolvedValue([mockGame]);

      const request = new Request("https://example.com/games");

      const response = await handleGamesRoute(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockGame]);

      expect(getPopularGames).toHaveBeenCalledTimes(1);
      expect(getPopularGames).toHaveBeenCalledWith(mockEnv, 0);

      expect(response.headers.get("Cache-Control")).toBe("public, max-age=900");
    });

    it.each([20, 40])(
      "should return popular games with offset %i",
      async (offset) => {
        vi.mocked(getPopularGames).mockResolvedValue([mockGame]);

        const request = new Request(
          `https://example.com/games?offset=${offset}`,
        );

        const response = await handleGamesRoute(request, mockEnv);

        expect(response.status).toBe(200);
        expect(getPopularGames).toHaveBeenCalledWith(mockEnv, offset);
      },
    );

    it("should search games when search parameter is provided", async () => {
      vi.mocked(searchGames).mockResolvedValue([mockGame]);

      const request = new Request("https://example.com/games?search=Thief");

      const response = await handleGamesRoute(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockGame]);

      expect(searchGames).toHaveBeenCalledWith(mockEnv, "Thief", 0);
      expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");
    });

    it("should search games with the provided offset", async () => {
      vi.mocked(searchGames).mockResolvedValue([mockGame]);

      const request = new Request(
        "https://example.com/games?search=Thief&offset=20",
      );

      const response = await handleGamesRoute(request, mockEnv);

      expect(response.status).toBe(200);
      expect(searchGames).toHaveBeenCalledWith(mockEnv, "Thief", 20);
    });

    it.each(["-1", "1.5", "abc", "", " ", "9007199254740992"])(
      "should reject invalid offset: %s",
      async (offset) => {
        const request = new Request(
          `https://example.com/games?offset=${encodeURIComponent(offset)}`,
        );

        const response = await handleGamesRoute(request, mockEnv);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toEqual({
          error: "Offset must be a non-negative integer",
        });

        expect(getPopularGames).not.toHaveBeenCalled();
        expect(searchGames).not.toHaveBeenCalled();
      },
    );

    it("should reject search terms shorter than 2 characters", async () => {
      const request = new Request("https://example.com/games?search=a");

      const response = await handleGamesRoute(request, mockEnv);

      expect(response.status).toBe(400);
      expect(getPopularGames).not.toHaveBeenCalled();
      expect(searchGames).not.toHaveBeenCalled();
    });

    it("should reject unsupported HTTP methods", async () => {
      const request = new Request("https://example.com/games", {
        method: "POST",
      });

      const response = await handleGamesRoute(request, mockEnv);

      expect(response.status).toBe(405);
    });

    it("should return 502 when the service fails", async () => {
      vi.mocked(getPopularGames).mockRejectedValue(
        new Error("IGDB unavailable"),
      );

      const request = new Request("https://example.com/games");

      const response = await handleGamesRoute(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data).toEqual({
        error: "Unable to fetch games",
      });
    });
  });

  describe("GET /games/:id", () => {
    it("should return game details", async () => {
      vi.mocked(getGameById).mockResolvedValue(mockGame);

      const request = new Request("https://example.com/games/1");

      const response = await handleGameDetailsRoute(request, mockEnv, 1);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockGame);

      expect(getGameById).toHaveBeenCalledWith(mockEnv, 1);
      expect(response.headers.get("Cache-Control")).toBe(
        "public, max-age=3600",
      );
    });

    it("should return 404 when the game does not exist", async () => {
      vi.mocked(getGameById).mockResolvedValue(null);

      const request = new Request("https://example.com/games/999999");

      const response = await handleGameDetailsRoute(request, mockEnv, 999999);

      expect(response.status).toBe(404);
    });

    it("should return 502 when the service fails", async () => {
      vi.mocked(getGameById).mockRejectedValue(new Error("IGDB unavailable"));

      const request = new Request("https://example.com/games/1");

      const response = await handleGameDetailsRoute(request, mockEnv, 1);

      expect(response.status).toBe(502);
    });

    it("should reject unsupported HTTP methods", async () => {
      const request = new Request("https://example.com/games/1", {
        method: "POST",
      });

      const response = await handleGameDetailsRoute(request, mockEnv, 1);

      expect(response.status).toBe(405);
    });
  });
});
