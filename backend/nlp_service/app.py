"""spaCy microservice using FastAPI.

Endpoints:
- POST /parse  -> returns tokens, lemmas, ents, noun_chunks, sentences, deps, intent (rule-based)
- POST /classify -> returns { intent, confidence } (placeholder rule-based classifier)

Design notes:
- spaCy operations are CPU-bound and blocking; to avoid blocking the event loop we run them in threadpool via `run_in_executor`.
- Endpoints validate input and return JSON with consistent shape.
- Errors return 5xx with a helpful message.
- For production, run with uvicorn/gunicorn and consider model preloading and worker sizing.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import spacy
import asyncio
import logging
import os


# Setup logger
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger("nlp_service")


class ParseRequest(BaseModel):
    text: str


class ClassifyRequest(BaseModel):
    text: str


app = FastAPI(title="spaCy NLP microservice")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load model at startup. Use small model by default, but allow override via ENV.
SPACY_MODEL = os.environ.get("SPACY_MODEL", "en_core_web_sm")
nlp = None


@app.on_event("startup")
async def startup_event():
    global nlp
    try:
        # Loading synchronously is acceptable at startup
        logger.info(f"Loading spaCy model '{SPACY_MODEL}'...")
        nlp = spacy.load(SPACY_MODEL)
        logger.info("spaCy model loaded")
    except Exception as e:
        logger.exception("Failed to load spaCy model")
        # If model fails to load, we still start the server but endpoints will raise
        nlp = None


async def parse_text_sync(text: str) -> Dict[str, Any]:
    """Run spaCy processing in a threadpool to avoid blocking the event loop.

    Returns a JSON-serializable dict with tokens, lemma_, ents, noun_chunks, deps, sentences.
    """
    if nlp is None:
        raise RuntimeError("spaCy model not loaded")

    loop = asyncio.get_running_loop()

    def _process():
        doc = nlp(text)
        # tokens
        tokens = [
            {
                "text": token.text,
                "lemma": token.lemma_,
                "pos": token.pos_,
                "tag": token.tag_,
                "dep": token.dep_,
                "is_stop": token.is_stop,
            }
            for token in doc
        ]

        # entities
        ents = [
            {"text": ent.text, "label": ent.label_, "start_char": ent.start_char, "end_char": ent.end_char}
            for ent in doc.ents
        ]

        # noun chunks
        noun_chunks = [nc.text for nc in doc.noun_chunks]

        # sentences
        sentences = [sent.text for sent in doc.sents]

        # simple dependency pairs (head->child)
        deps = [
            {"token": token.text, "head": token.head.text, "dep": token.dep_}
            for token in doc
        ]

        # A very small rule-based intent guess (placeholder for a trained classifier)
        intent = guess_intent_from_text(text.lower())

        return {
            "tokens": tokens,
            "entities": ents,
            "noun_chunks": noun_chunks,
            "sentences": sentences,
            "deps": deps,
            "intent": intent,
        }

    return await loop.run_in_executor(None, _process)


def guess_intent_from_text(text: str) -> Dict[str, Any]:
    """A tiny rule-based intent detector as a placeholder.

    Replace this with a proper textcat classifier or an external model for production.
    Returns {'name': str, 'confidence': float, 'action': optional_action}
    """
    # Order matters: more specific checks first
    if any(kw in text for kw in ["find", "search", "looking for", "show me", "do you have"]):
        return {"name": "search_product", "confidence": 0.75, "action": "search"}
    if any(kw in text for kw in ["price", "how much", "cost"]):
        return {"name": "ask_price", "confidence": 0.7}
    if any(kw in text for kw in ["hello", "hi", "hey"]):
        return {"name": "greeting", "confidence": 0.9}
    if any(kw in text for kw in ["order", "buy", "purchase"]):
        return {"name": "purchase_intent", "confidence": 0.7, "action": "purchase"}
    # fallback
    return {"name": "unknown", "confidence": 0.5}


@app.post("/parse")
async def parse(req: ParseRequest):
    try:
        if not req.text or not req.text.strip():
            raise HTTPException(status_code=400, detail="Empty text is not allowed")

        result = await parse_text_sync(req.text)
        return {"ok": True, "result": result}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/parse failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify")
async def classify(req: ClassifyRequest):
    try:
        if not req.text or not req.text.strip():
            raise HTTPException(status_code=400, detail="Empty text is not allowed")

        # Placeholder classification using the same rule-based logic
        intent = guess_intent_from_text(req.text.lower())
        return {"ok": True, "intent": intent}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/classify failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    # Basic healthcheck to ensure model loaded
    return {"ok": True, "model_loaded": nlp is not None}


if __name__ == "__main__":
    import uvicorn

    # Default host/port, override with env or uvicorn args in production
    uvicorn.run("app:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=False)
