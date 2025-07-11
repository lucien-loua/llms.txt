import { openai } from "@ai-sdk/openai";
import FirecrawlApp, {
  type ErrorResponse,
  type MapResponse,
} from "@mendable/firecrawl-js";
import { generateText } from "ai";
import { buildUserPrompt, getSystemPrompt } from "@/lib/system-prompts";

export async function mapUrl(
  url: string,
  apiKey: string,
  maxUrls: number,
): Promise<MapResponse | ErrorResponse> {
  const firecrawl = new FirecrawlApp({ apiKey });
  return await firecrawl.mapUrl(url, { limit: maxUrls });
}

export async function scrapeUrl(url: string, apiKey: string): Promise<string> {
  const firecrawl = new FirecrawlApp({ apiKey });
  const res = await firecrawl.scrapeUrl(url, {
    formats: ["markdown"],
    onlyMainContent: true,
    timeout: 30000,
  });
  if (!res.success || !res.markdown) throw new Error("Scraping failed");
  return res.markdown;
}

export async function summarize(
  pageUrl: string,
  markdown: string,
): Promise<{ title: string; description: string }> {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      { role: "system", content: getSystemPrompt() },
      { role: "user", content: buildUserPrompt(pageUrl, markdown) },
    ],
    maxTokens: 100,
    temperature: 0.3,
  });
  const match = text.match(/\{[\s\S]*?\}/);
  const clean = match ? match[0] : text;
  const json = JSON.parse(clean);
  return {
    title: typeof json.title === "string" ? json.title : "Page",
    description:
      typeof json.description === "string"
        ? json.description
        : "No description available",
  };
}
