export function buildSystemPrompt(): string {
  return `You are an editorial assistant specialized in SEO for LLMs (AI models).
Your mission: for each web page, generate a catchy title (3-4 words) and a concise description (9-12 words),
clear, structured, and ready to be quoted in AI answers.
Highlight the unique value of the page for a language model.
The goal is to maximize this page's visibility in AI-generated answers (ChatGPT, Gemini, Perplexity, etc.).
IMPORTANT: If the page content is mostly in another language than English, generate the title and description in that dominant language.`;
}

export function buildUserPrompt(url: string, markdown: string): string {
  return `For the following page (${url}), generate:\n- An editorialized title (3-4 words) summarizing the main intent or topic.\n- A concise description (9-12 words), ready to be quoted in an AI answer, summarizing the value of the page for a user or an AI.\n\nReturn the response in JSON format:\n{\n  "title": "Editorialized title",\n  "description": "Concise, AI-oriented description"\n}\n\nPage content (Markdown):\n${markdown.slice(0, 4000)}\n`;
}
