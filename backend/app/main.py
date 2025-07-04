import os
import json
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl, Field
from .generate_llmstxt import FirecrawlLLMsTextGenerator
import queue
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("llms-api")

app = FastAPI()

class GenerateRequest(BaseModel):
    url: HttpUrl
    maxUrls: int = Field(20, ge=1, le=100)
    firecrawlApiKey: str = Field(..., min_length=10)

@app.post("/generate")
async def generate(request: Request):
    """
    Endpoint principal pour générer les fichiers à partir d'une URL.
    Retourne un flux d'événements SSE pour suivre la progression.
    """
    try:
        data = await request.json()
        req = GenerateRequest(**data)
    except Exception as e:
        logger.error(f"Requête invalide: {e}")
        raise HTTPException(status_code=400, detail="Requête invalide")

    def event_stream():
        q = queue.Queue()
        stop_marker = object()
        def on_progress(data):
            q.put(data)
        def run_generation():
            try:
                openai_api_key = os.getenv("OPENAI_API_KEY")
                generator = FirecrawlLLMsTextGenerator(req.firecrawlApiKey, openai_api_key)
                generator.generate_llmstxt(str(req.url), req.maxUrls, on_progress=on_progress)
            except Exception as e:
                q.put({"status": "error", "errors": [str(e)]})
            finally:
                q.put(stop_marker)
        thread = threading.Thread(target=run_generation)
        thread.start()
        while True:
            event = q.get()
            if event is stop_marker:
                break
            yield f"data: {json.dumps(event)}\n\n"
    return StreamingResponse(event_stream(), media_type='text/event-stream')

@app.get("/health")
async def health():
    """
    Endpoint de santé pour vérifier si l'API fonctionne.
    """
    return {"status": "ok"}
