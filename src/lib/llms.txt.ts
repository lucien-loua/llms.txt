export interface PageResult {
  url: string;
  title: string;
  description: string;
  markdown: string;
  index: number;
}

function cleanMarkdownForLlms(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return '';
  let clean = markdown;
  clean = clean.replace(/\\+/g, '');
  clean = clean.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    let cleanText = text
      .replace(/\n+/g, ' ')
      .replace(/ {2,}/g, ' ')
      .trim();
    cleanText = cleanText.replace(/([a-z])([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/g, '$1 $2');
    cleanText = cleanText.replace(/([a-zA-Z])([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþ]+ [a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþ]+)/g, '$1\n$2');
    return `[${cleanText}](${url})`;
  });
  clean = clean.replace(/\[([^\]]*)\]\(\s*\)/g, '$1');
  clean = clean.replace(/(\[[^\]]+\]\([^)]+\))/g, '\n$1\n');
  clean = clean.replace(/\n +/g, '\n');
  clean = clean.replace(/ {2,}/g, ' ');
  clean = clean.replace(/[ \t]+$/gm, '');
  clean = clean.replace(/^\s+/gm, '');
  clean = clean.replace(/^\s*([*-])\s+/gm, '- ');
  clean = clean.replace(/^\s*(\d+)\.\s+/gm, (_, n) => `${n}. `);
  clean = clean.replace(/\)\s*([\w\p{L}])/gu, ') $1');
  clean = clean.replace(/([a-zA-ZéèêàùûîôçÉÈÊÀÙÛÎÔÇ])\n([a-zA-ZéèêàùûîôçÉÈÊÀÙÛÎÔÇ])/g, (match, char1, char2) => {
    if (char1.toLowerCase() === char1 && char2.toLowerCase() === char2) {
      return char1 + char2;
    }
    return match;
  });
  clean = clean.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');
  clean = clean.replace(/\n{3,}/g, '\n\n');
  clean = clean.replace(/#+\s*\n/g, '');
  clean = clean.replace(/^[-*_]{3,}$/gm, '');
  clean = clean.replace(/^(#{1,6}.*?)$/gm, '\n$1\n');
  clean = clean.replace(/^\n+/gm, '\n');
  clean = clean.replace(/\n{3,}/g, '\n\n');
  return clean.trim();
}

export function buildLlmsFiles(
  results: PageResult[],
  siteUrl: string,
  userKey: string | undefined,
): { llmsTxt: string; llmsFullTxt: string } {
  const IGNORED_EXTENSIONS = [
    '.xml', '.json', '.png', '.jpg', '.jpeg',
    '.ico', '.svg', '.webp', '.gif'
  ];
  const IGNORED_NAMES = [
    'sitemap.xml', 'robots.txt', 'feed.xml', 'rss.xml'
  ];
  const MIN_CONTENT_LENGTH = 30;
  const isContentPage = (result: PageResult): boolean => {
    const urlLower = result.url.toLowerCase();
    const siteUrlLower = siteUrl.toLowerCase();
    const isRoot = urlLower === siteUrlLower || urlLower === `${siteUrlLower}/`;
    if (
      IGNORED_EXTENSIONS.some(ext => urlLower.endsWith(ext)) ||
      IGNORED_NAMES.some(name => urlLower.endsWith(name))
    ) return false;
    if (!isRoot && urlLower.endsWith('/')) return false;
    if (
      result.title === 'Page' ||
      !result.markdown ||
      result.markdown.trim().length < MIN_CONTENT_LENGTH
    ) return false;
    return true;
  };
  const filteredResults = results
    .filter(isContentPage)
    .sort((a, b) => a.index - b.index);
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  });
  const header = `# ${siteUrl} llms.txt\n# Generated on ${timestamp}\n`;
  const fullHeader = header.replace('llms.txt', 'llms-full.txt');
  let llmsTxt = `${header}\n`;
  let llmsFullTxt = `${fullHeader}\n`;
  filteredResults.forEach((result) => {
    llmsTxt += `- [${result.title}](${result.url}): ${result.description}\n`;
    const cleanMarkdown = cleanMarkdownForLlms(result.markdown);
    llmsFullTxt += `## ${result.title}\n`;
    if (result.description) {
      llmsFullTxt += `*${result.description}*\n\n`;
    }
    llmsFullTxt += `${cleanMarkdown}\n\n---\n`;
  });
  if (!userKey) {
    llmsTxt += `\n\n*Note: This is a partial result. For the full generation, add your Firecrawl key in the settings.*\n`;
  }
  return {
    llmsTxt: llmsTxt.trim(),
    llmsFullTxt: llmsFullTxt.trim()
  };
}
