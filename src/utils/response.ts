export function jsonResponse(
  data: unknown,
  status = 200,
  cacheSeconds?: number,
): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control":
      cacheSeconds !== undefined && status === 200
        ? `public, max-age=${cacheSeconds}`
        : "no-store",
  });

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}
