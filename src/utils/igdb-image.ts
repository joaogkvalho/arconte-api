import type { Game, GameDetails } from "../types/game";

type IGDBImageSize = "cover_big" | "screenshot_1080p";

export function formatIGDBImageUrl(
  imageUrl: string,
  size: IGDBImageSize,
): string {
  const secureUrl = imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl;

  return secureUrl.replace(/\/t_[^/]+\//, `/t_${size}/`);
}

export function normalizeGameImages<T extends Game>(game: T): T {
  const normalizedGame = {
    ...game,

    cover: game.cover
      ? {
          ...game.cover,
          url: formatIGDBImageUrl(game.cover.url, "cover_big"),
        }
      : undefined,
  };

  if ("screenshots" in game) {
    const details = game as GameDetails;

    return {
      ...normalizedGame,
      screenshots: details.screenshots?.map((screenshot) => ({
        ...screenshot,
        url: formatIGDBImageUrl(screenshot.url, "screenshot_1080p"),
      })),
      similar_games: details.similar_games?.map((similarGame) => ({
        ...similarGame,
        cover: similarGame.cover
          ? {
              ...similarGame.cover,
              url: formatIGDBImageUrl(similarGame.cover.url, "cover_big"),
            }
          : undefined,
      })),
    } as T;
  }

  return normalizedGame as T;
}
