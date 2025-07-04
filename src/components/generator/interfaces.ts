export interface GenerationProgress {
  status: "idle" | "mapping" | "scraping" | "generating" | "completed" | "error";
  totalUrls: number;
  processedUrls: number;
  currentUrl?: string;
  errors: Array<{ url?: string; message: string }>;
  files?: {
    llmsTxt?: string;
    llmsFullTxt?: string;
  };
}

export interface GeneratorConfig {
  url: string;
  maxUrls: number;
  firecrawlApiKey: string;
  openaiApiKey: string;
}