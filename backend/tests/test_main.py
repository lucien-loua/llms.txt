import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_generate_validation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Données incomplètes (manque des champs obligatoires)
        response = await ac.post("/generate", json={"url": "https://example.com"})
    assert response.status_code == 400
    assert "Requête invalide" in response.text

@pytest.mark.asyncio
async def test_generate_sse_success(monkeypatch):
    class DummyGen:
        def __init__(self, *a, **kw): pass
        def generate_llmstxt(self, url, max_urls, show_full_text=True, on_progress=None):
            if on_progress:
                on_progress({"status": "mapping", "totalUrls": 1, "processedUrls": 0, "errors": []})
                on_progress({"status": "scraping", "totalUrls": 1, "processedUrls": 1, "currentUrl": url, "errors": []})
                on_progress({"status": "generating", "totalUrls": 1, "processedUrls": 1, "errors": []})
                on_progress({"status": "completed", "totalUrls": 1, "processedUrls": 1, "errors": [], "files": {"llmsTxt": "foo", "llmsFullTxt": "bar"}})
            return {"llmstxt": "foo", "llms_fulltxt": "bar", "num_urls_processed": 1, "num_urls_total": 1}
    monkeypatch.setattr("app.main.FirecrawlLLMsTextGenerator", DummyGen)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/generate", json={
            "url": "https://example.com",
            "maxUrls": 1,
            "firecrawlApiKey": "fc-1234567890"
        })
        assert response.status_code == 200
        body = b"".join([chunk async for chunk in response.aiter_bytes()])
        assert b"mapping" in body
        assert b"scraping" in body
        assert b"generating" in body
        assert b"completed" in body
