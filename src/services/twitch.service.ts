import type { Env } from "../types/env";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

let cachedToken: CachedToken | null = null;

export async function getTwitchAccessToken(env: Env): Promise<string> {
  const now = Date.now();

  if (cachedToken && cachedToken.expiresAt > now + 60_600) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    client_id: env.TWITCH_CLIENT_ID,
    client_secret: env.TWITCH_CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const response = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Twitch authentication failed: ${response.status}`);
  }

  const data = (await response.json()) as TwitchTokenResponse;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.accessToken;
}
