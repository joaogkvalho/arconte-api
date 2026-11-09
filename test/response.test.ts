import { describe, expect, it } from "vitest";
import { jsonResponse } from "../src/utils/response";

describe("JSON Response Utility", () => {
  it("should return a JSON response with status 200 by default", async () => {
    const data = { message: "Success" };

    const response = jsonResponse(data);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(await response.json()).toEqual(data);
  });

  it("should allow a custom status code", async () => {
    const response = jsonResponse({ error: "Not found" }, 404);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "Not found",
    });
  });

  it("should set Cache-Control when cache duration is provided", () => {
    const response = jsonResponse({ message: "Success" }, 200, 900);

    expect(response.headers.get("Cache-Control")).toBe("public, max-age=900");
  });

  it("should set no-store when cache duration is omitted", () => {
    const response = jsonResponse({ message: "Success" });

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("should not cache error responses", () => {
    const response = jsonResponse({ error: "Internal error" }, 500, 900);

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
