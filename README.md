# `llms.txt`

![llms.txt OpenGraph preview](src/app/opengraph-image.png)

https://github.com/user-attachments/assets/2ce04936-d18a-4148-8c82-25bbc306f608

## Project Overview

`llms.txt` is a web application for generating consolidated text files from websites, designed for Large Language Model training and inference. It produces:
- `llms.txt`: An index of site pages with AI-generated titles and descriptions.
- `llms-full.txt`: The full plain text content of all crawled pages.

The tool uses [Firecrawl](https://www.firecrawl.dev/) for crawling and scraping, and [OpenAI](https://platform.openai.com/) for generating titles and descriptions.

## Architecture

- **Fullstack**: Next.js 15, React 19, TailwindCSS, Shadcn/UI, modern interface.
- **API calls**: All crawling and AI logic is handled server-side in Next.js API routes (no separate backend needed).

## Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/) (recommended)
- API keys (required):
  - Firecrawl ([get your key](https://www.firecrawl.dev/app/api-keys))
    - You can provide your key in the UI (Settings) or in a `.env` file as `FIRECRAWL_API_KEY` at the project root.
  - OpenAI (`OPENAI_API_KEY` environment variable, **mandatory**)
    - Must be set in your `.env` file or exported in your shell.

## Installation

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```
2. Add your API keys to a `.env` file at the project root:
   ```env
   FIRECRAWL_API_KEY=fc-...
   OPENAI_API_KEY=sk-...
   ```
   - `FIRECRAWL_API_KEY` can also be provided directly in the app UI (Settings > Firecrawl API Key).
   - `OPENAI_API_KEY` is **mandatory** and must be present in the environment or `.env`.
3. Start the development server:
   ```bash
   pnpm dev
   ```
   The app will be accessible at [http://localhost:3000](http://localhost:3000).

## Usage

1. Enter the website URL to crawl in the input field.
2. Configure your Firecrawl API key in the settings (gear icon) or via `.env`.
3. Make sure your OpenAI API key is set in the environment or `.env`.
4. Start the generation and monitor progress.
5. Download the generated files (`llms.txt`, `llms-full.txt`).

## Customization

- Set the maximum number of URLs to crawl (configurable in the UI).

## Technologies

- **Fullstack**: Next.js, React, TailwindCSS, Shadcn/UI
- **Crawling & AI**: Firecrawl REST API, OpenAI

## Deployment

- Deployable on Vercel, Docker, or any platform supporting Next.js 15.
- No separate backend or Docker container required.

## Resources

- [Firecrawl Documentation](https://docs.firecrawl.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Next.js Documentation](https://nextjs.org/docs)

---

© 2025 - Open source project under the MIT license.
