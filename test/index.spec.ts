import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("Arconte API", () => {
  describe("GET /health", () => {
    it("should return API health status", async () => {
      const response = await SELF.fetch("https://example.com/health");

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: "ok",
        service: "arconte-api",
      });
    });
  });

  describe("404 errors", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await SELF.fetch("https://example.com/unknown");

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Route not found",
      });
    });
  });

  describe("HTTP methods", () => {
    it("should reject POST requests to /games", async () => {
      const response = await SELF.fetch("https://example.com/games", {
        method: "POST",
      });

      expect(response.status).toBe(405);
    });

    it("should reject POST requests to /games/:id", async () => {
      const response = await SELF.fetch("https://example.com/games/1", {
        method: "POST",
      });

      expect(response.status).toBe(405);
    });
  });

  describe("GET /games validation", () => {
    it("should reject search terms shorter than 2 characters", async () => {
      const response = await SELF.fetch("https://example.com/games?search=a");

      expect(response.status).toBe(400);
    });
  });
});
