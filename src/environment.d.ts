declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Firecrawl API key for crawling and indexing websites. */
      FIRECRAWL_API_KEY: string;
    }
  }
}

export { };
