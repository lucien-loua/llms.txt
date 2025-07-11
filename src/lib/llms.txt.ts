export interface PageResult {
  url: string;
  title: string;
  description: string;
  markdown: string;
  index: number;
}

function cleanMarkdownForLlms(markdown: string): string {
  let clean = markdown.replace(/\\+/g, "");
  clean = clean.replace(/\[([^\]]+)\]((?:\([^)]+\)))/g, (_, text, url) => {
    return `[${text.replace(/\n+/g, " ").replace(/ {2,}/g, " ").trim()}]${url}`;
  });
  clean = clean.replace(/(\[[^\]]+\]\([^)]+\))/g, "$1\n");
  clean = clean.replace(/\n +/g, "\n");
  clean = clean.replace(/\n{3,}/g, "\n\n");
  clean = clean.replace(/ {2,}/g, " ");
  return clean;
}

export function buildLlmsFiles(
  results: PageResult[],
  siteUrl: string,
  userKey: string | undefined,
): { llmsTxt: string; llmsFullTxt: string } {
  const ignoredExtensions = [
    ".xml",
    ".json",
    ".png",
    ".jpg",
    ".jpeg",
    ".ico",
    ".svg",
    ".webp",
    ".gif",
  ];
  const ignoredNames = ["sitemap.xml", "robots.txt", "feed.xml", "rss.xml"];
  const isContentPage = (r: PageResult) => {
    const urlLower = r.url.toLowerCase();
    const isRoot =
      urlLower === siteUrl.toLowerCase() ||
      urlLower === `${siteUrl.toLowerCase()}/`;
    if (
      ignoredExtensions.some((ext) => urlLower.endsWith(ext)) ||
      ignoredNames.some((name) => urlLower.endsWith(name)) ||
      (!isRoot && urlLower.endsWith("/")) ||
      r.title === "Page" ||
      !r.markdown ||
      r.markdown.trim().length < 30
    ) {
      if (isRoot && r.markdown && r.markdown.trim().length >= 30) return true;
      return false;
    }
    return true;
  };
  const filtered = results
    .filter(isContentPage)
    .sort((a, b) => a.index - b.index);

  const now = new Date().toLocaleDateString("en-GB");
  const header = `# ${siteUrl} llms.txt\n# Generated on ${now}\n`;
  let llmsTxt = `${header}\n`;
  let llmsFullTxt = `${header.replace("llms.txt", "llms-full.txt")}\n`;
  filtered.forEach((r, i) => {
    llmsTxt += `- [${r.title}](${r.url}): ${r.description}\n`;
    const cleanMarkdown = cleanMarkdownForLlms(r.markdown);
    llmsFullTxt +=
      `<|firecrawl-page-${i + 1}-lllmstxt|>\n` +
      `## ${r.title}\n` +
      (r.description ? `*${r.description}*\n\n` : "") +
      `${cleanMarkdown}\n\n---\n`;
  });
  const cleanFullTxt = llmsFullTxt.replace(
    /<\|firecrawl-page-\d+-lllmstxt\|>\n/g,
    "",
  );
  if (!userKey) {
    llmsTxt += `\n\n*Note: This is a partial result. For the full generation, add your Firecrawl key in the settings.*\n`;
  }
  return { llmsTxt, llmsFullTxt: cleanFullTxt };
}
