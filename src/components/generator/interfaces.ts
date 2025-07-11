export interface ProgressError {
  url?: string;
  message: string;
}
export interface GenerationProgress {
  status: "idle" | "mapping" | "scraping" | "generating" | "completed" | "error";
  totalUrls: number;
  processedUrls: number;
  currentUrl?: string;
  errors: Array<ProgressError>;
  files?: {
    llmsTxt?: string;
    llmsFullTxt?: string;
  };
}

export interface GeneratorConfig {
  url: string;
  maxUrls: number;
  bringYourOwnKey?: string;
}
