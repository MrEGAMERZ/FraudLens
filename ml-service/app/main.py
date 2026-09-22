from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import os

from judge import run_judge

app = FastAPI(title="FraudLens ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class JudgeRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "fraudlens-ml"}


@app.post("/judge")
async def judge(req: JudgeRequest):
    """
    Main endpoint: takes offer text or URL, returns structured analysis.
    Calls Gemini Flash for FFCS + financial ask + linguistic signals.
    """
    content = req.text

    # If URL provided, fetch page text first
    if req.url and not content:
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                r = await client.get(req.url, headers={"User-Agent": "FraudLens/1.0"})
                r.raise_for_status()
                # Very basic HTML text extraction
                text = r.text
                # Strip obvious HTML tags
                import re
                content = re.sub(r'<[^>]+>', ' ', text)
                content = re.sub(r'\s+', ' ', content).strip()[:4000]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")

    if not content or len(content.strip()) < 20:
        raise HTTPException(status_code=400, detail="No analyzable text provided")

    result = await run_judge(content)
    return result


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
