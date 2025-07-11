import type { NextRequest } from "next/server";
import type {
  GeneratorConfig,
  ProgressError,
} from "@/components/generator/interfaces";
import { mapUrl, scrapeUrl, summarize } from "@/lib/firecrawl";
import { buildLlmsFiles, type PageResult } from "@/lib/llms.txt";
import { normalizeUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const {
    url: rawUrl,
    bringYourOwnKey,
    maxUrls,
  } = (await req.json()) as Partial<GeneratorConfig>;

  const url = normalizeUrl(rawUrl);

  const firecrawlApiKey = bringYourOwnKey || process.env.FIRECRAWL_API_KEY;
  const effectiveMaxUrls = bringYourOwnKey ? maxUrls || 50 : 10;
  if (!firecrawlApiKey) {
    return new Response(
      `data: ${JSON.stringify({ status: "error", errors: [{ message: "FIRECRAWL_API_KEY missing" }] })}\n\n`,
      { headers: { "Content-Type": "text/event-stream" } },
    );
  }
  let mapRes = null;
  try {
    mapRes = await mapUrl(url, firecrawlApiKey, effectiveMaxUrls);
  } catch (e) {
    return new Response(
      `data: ${JSON.stringify({ status: "error", errors: [{ message: `Firecrawl map error: ${(e as Error).message}` }] })}\n\n`,
      { headers: { "Content-Type": "text/event-stream" } },
    );
  }
  if (
    !mapRes?.success ||
    !Array.isArray(mapRes.links) ||
    !mapRes.links ||
    mapRes.links.length === 0
  ) {
    return new Response(
      `data: ${JSON.stringify({ status: "error", errors: [{ message: "No URLs found for this site." }] })}\n\n`,
      { headers: { "Content-Type": "text/event-stream" } },
    );
  }
  const urls: string[] = mapRes.links.slice(
    0,
    Math.max(1, Math.min(effectiveMaxUrls, 50)),
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ status: "mapping", totalUrls: urls.length, processedUrls: 0, errors: [] })}\n\n`,
        ),
      );

      let processed = 0;
      const errors: ProgressError[] = [];

      const jobs = urls.map((pageUrl, idx) =>
        (async () => {
          let markdown = "";
          try {
            markdown = await scrapeUrl(pageUrl, firecrawlApiKey);
          } catch (err) {
            errors.push({
              url: pageUrl,
              message: err instanceof Error ? err.message : "Scraping failed",
            });
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ status: "scraping", processedUrls: ++processed, currentUrl: pageUrl, errors: [{ url: pageUrl, message: err instanceof Error ? err.message : "Scraping failed" }] })}\n\n`,
              ),
            );
            return null;
          }

          let title = "Page",
            description = "No description available";
          try {
            const result = await summarize(pageUrl, markdown);
            title = result.title;
            description = result.description;
          } catch {
            if (title === "Page") {
              const match = markdown.match(/^# (.+)$/m);
              if (match) {
                title = match[1].trim();
              }
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ status: "scraping", processedUrls: ++processed, currentUrl: pageUrl, errors: [] })}\n\n`,
            ),
          );
          return { url: pageUrl, title, description, markdown, index: idx };
        })(),
      );

      const settled = await Promise.allSettled(jobs);
      const validResults = settled
        .map((r) => (r.status === "fulfilled" && r.value ? r.value : null))
        .filter((r): r is PageResult => r !== null);

      validResults.sort((a, b) => a.index - b.index);

      const { llmsTxt, llmsFullTxt } = buildLlmsFiles(
        validResults,
        url,
        bringYourOwnKey,
      );

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            status: "completed",
            totalUrls: urls.length,
            processedUrls: validResults.length,
            files: { llmsTxt, llmsFullTxt: llmsFullTxt },
            errors,
          })}\n\n`,
        ),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
