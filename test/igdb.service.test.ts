import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Env } from "../src/types/env";

import { getTwitchAccessToken } from "../src/services/twitch.service";

import {
  getPopularGames,
  searchGames,
  getGameById,
} from "../src/services/igdb.service";

vi.mock("../src/services/twitch.service", () => ({
  getTwitchAccessToken: vi.fn(),
}));

const mockEnv: Env = {
  TWITCH_CLIENT_ID: "test-client-id",
  TWITCH_CLIENT_SECRET: "test-client-secret",
};

const mockGame = {
  id: 1,
  name: "Thief II: The Metal Age",
  summary: "A stealth game.",
  rating: 90,
  cover: {
    id: 291911,
    url: "//images.igdb.com/igdb/image/upload/t_thumb/co698n.jpg",
  },
};

const mockGameDetails = {
  ...mockGame,
  screenshots: [
    {
      id: 10,
      url: "//images.igdb.com/igdb/image/upload/t_thumb/screenshot.jpg",
      width: 1920,
      height: 1080,
    },
  ],
  similar_games: [
    {
      id: 2,
      name: "Thief",
      cover: {
        id: 20,
        url: "//images.igdb.com/igdb/image/upload/t_thumb/co123.jpg",
      },
    },
  ],
};

describe("IGDB Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getTwitchAccessToken).mockResolvedValue("test-access-token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("should fetch popular games successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([mockGame]), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const games = await getPopularGames(mockEnv);

    expect(games).toHaveLength(1);
    expect(games[0].name).toBe("Thief II: The Metal Age");

    expect(games[0].cover?.url).toContain("/t_cover_big/");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getTwitchAccessToken).toHaveBeenCalledTimes(1);

    const requestBody = fetchMock.mock.calls[0][1]?.body;

    expect(requestBody).toContain("limit 20;");
    expect(requestBody).toContain("offset 0;");
  });

  it("should fetch popular games with pagination offset", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([mockGame]), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await getPopularGames(mockEnv, 20);

    const requestBody = fetchMock.mock.calls[0][1]?.body;

    expect(requestBody).toContain("limit 20;");
    expect(requestBody).toContain("offset 20;");
  });

  it("should search games successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([mockGame]), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const games = await searchGames(mockEnv, "Thief");

    expect(games).toHaveLength(1);
    expect(games[0].name).toBe("Thief II: The Metal Age");

    const requestBody = fetchMock.mock.calls[0][1]?.body;

    expect(requestBody).toContain('search "Thief"');

    expect(requestBody).toContain("limit 20;");
    expect(requestBody).toContain("offset 0;");
  });

  it("should search games with pagination offset", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([mockGame]), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await searchGames(mockEnv, "Thief", 20);

    const requestBody = fetchMock.mock.calls[0][1]?.body;

    expect(requestBody).toContain('search "Thief"');
    expect(requestBody).toContain("limit 20;");
    expect(requestBody).toContain("offset 20;");
  });

  it("should fetch the third page of popular games", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([mockGame]), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await getPopularGames(mockEnv, 40);

    const requestBody = fetchMock.mock.calls[0][1]?.body;

    expect(requestBody).toContain("offset 40;");
  });

  it("should fetch game details successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([mockGameDetails]), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const game = await getGameById(mockEnv, 1);

    expect(game).not.toBeNull();
    expect(game?.name).toBe("Thief II: The Metal Age");

    expect(game?.cover?.url).toContain("/t_cover_big/");

    expect(game?.screenshots?.[0].url).toContain("/t_1080p/");

    expect(game?.similar_games?.[0].cover?.url).toContain("/t_cover_big/");
  });

  it("should return null when the game does not exist", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const game = await getGameById(mockEnv, 999999);

    expect(game).toBeNull();
  });

  it("should throw an error when IGDB request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 500,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(getPopularGames(mockEnv)).rejects.toThrow();
  });
});
