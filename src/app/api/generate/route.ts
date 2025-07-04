import type { NextRequest } from "next/server";
import { apiUrl } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, maxUrls, firecrawlApiKey } = body;
  const response = await fetch(`${apiUrl}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, maxUrls, firecrawlApiKey }),
  });

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
