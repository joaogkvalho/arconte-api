import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Env } from "../src/types/env";

const mockEnv: Env = {
  TWITCH_CLIENT_ID: "test-client-id",
  TWITCH_CLIENT_SECRET: "test-client-secret",
};

describe("Twitch Service", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should obtain an access token successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "test-access-token",
          expires_in: 3600,
          token_type: "bearer",
        }),
        { status: 200 },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { getTwitchAccessToken } =
      await import("../src/services/twitch.service");

    const token = await getTwitchAccessToken(mockEnv);

    expect(token).toBe("test-access-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should reuse a valid cached token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "cached-access-token",
          expires_in: 3600,
          token_type: "bearer",
        }),
        { status: 200 },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { getTwitchAccessToken } =
      await import("../src/services/twitch.service");

    const firstToken = await getTwitchAccessToken(mockEnv);
    const secondToken = await getTwitchAccessToken(mockEnv);

    expect(firstToken).toBe("cached-access-token");
    expect(secondToken).toBe("cached-access-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when authentication fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    vi.stubGlobal("fetch", fetchMock);

    const { getTwitchAccessToken } =
      await import("../src/services/twitch.service");

    await expect(getTwitchAccessToken(mockEnv)).rejects.toThrow(
      "Twitch authentication failed: 401",
    );
  });
});
