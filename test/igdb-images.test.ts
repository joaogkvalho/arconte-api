import { describe, expect, it } from "vitest";

import {
  formatIGDBImageUrl,
  normalizeGameImages,
} from "../src/utils/igdb-image";

import type { GameDetails } from "../src/types/game";

describe("IGDB Image Utilities", () => {
  describe("formatIGDBImageUrl", () => {
    it("should convert protocol-relative URLs to HTTPS", () => {
      const url = "//images.igdb.com/igdb/image/upload/t_thumb/co698n.jpg";

      const result = formatIGDBImageUrl(url, "cover_big");

      expect(result).toBe(
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co698n.jpg",
      );
    });

    it("should replace the existing image size", () => {
      const url =
        "https://images.igdb.com/igdb/image/upload/t_thumb/co698n.jpg";

      const result = formatIGDBImageUrl(url, "1080p");

      expect(result).toContain("/t_1080p/");
    });
  });

  describe("normalizeGameImages", () => {
    const mockGame: GameDetails = {
      id: 1,
      name: "Thief II: The Metal Age",
      cover: {
        id: 291911,
        url: "//images.igdb.com/igdb/image/upload/t_thumb/co698n.jpg",
      },
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

    it("should normalize the main cover", () => {
      const result = normalizeGameImages(mockGame);

      expect(result.cover?.url).toContain("/t_cover_big/");
      expect(result.cover?.url.startsWith("https://")).toBe(true);
    });

    it("should normalize screenshots to 1080p", () => {
      const result = normalizeGameImages(mockGame);

      expect(result.screenshots?.[0].url).toContain("/t_1080p/");
      expect(result.screenshots?.[0].url.startsWith("https://")).toBe(true);
    });

    it("should normalize similar games covers", () => {
      const result = normalizeGameImages(mockGame);

      expect(result.similar_games?.[0].cover?.url).toContain("/t_cover_big/");
    });

    it("should preserve the original game data", () => {
      const result = normalizeGameImages(mockGame);

      expect(result.id).toBe(mockGame.id);
      expect(result.name).toBe(mockGame.name);
      expect(result.screenshots?.[0].width).toBe(1920);
      expect(result.screenshots?.[0].height).toBe(1080);
    });
  });
});
