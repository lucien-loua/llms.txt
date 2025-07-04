# `llms.txt`

![llms.txt OpenGraph preview](src/app/opengraph-image.png)

## Project Overview

`llms.txt` is a web application for generating consolidated text files from websites, designed for Large Language Model training and inference. It produces:
- `llms.txt`: An index of site pages with AI-generated titles and descriptions.
- `llms-full.txt`: The full plain text content of all crawled pages.

The tool uses [Firecrawl](https://www.firecrawl.dev/) for crawling and scraping, and [OpenAI](https://platform.openai.com/) for generating titles and descriptions.

## Architecture

- **Frontend**: Next.js 15, React 19, TailwindCSS, Shadcn/UI, modern interface.
- **Backend**: Python API (FastAPI) orchestrating Firecrawl REST API and OpenAI, containerized with Docker.

## Prerequisites

- Node.js >= 20
- [pnpm](https://pnpm.io/) (recommended)
- Docker
- API keys:
  - Firecrawl ([get your key](https://www.firecrawl.dev/app/api-keys))
  - OpenAI (`OPENAI_API_KEY` environment variable)

## Installation

### Backend (Python API)

1. Add your OpenAI key to a `.env` file at the project root or export it in your shell:
   ```bash
   export OPENAI_API_KEY=sk-...
   ```
2. Start the backend:
   ```bash
   docker compose up --build
   ```
   The API will be available at `http://localhost:5001`.

### Frontend (Next.js)

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
   The app will be accessible at [http://localhost:3000](http://localhost:3000).

3. Ensure the `API_URL` environment variable in the frontend points to the backend API (default: `http://localhost:5001`).

## Usage

1. Enter the website URL to crawl in the input field.
2. Configure your API keys in the settings (gear icon).
3. Start the generation and monitor progress.
4. Download the generated files (`llms.txt`, `llms-full.txt`).

## Customization

- Set the maximum number of URLs to crawl (configurable in the UI).

## Technologies

- **Frontend**: Next.js, React, TailwindCSS, Shadcn/UI
- **Backend**: FastAPI, Firecrawl REST API, OpenAI, Python, Docker

## Deployment

- Frontend: Compatible with Vercel, Docker, and other platforms.
- Backend: Ready-to-use Docker container.

## Resources

- [Firecrawl Documentation](https://docs.firecrawl.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

© 2025 - Open source project under the MIT license.
