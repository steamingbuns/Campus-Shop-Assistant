spaCy microservice (FastAPI)

Quick start (local development):

1. Create a Python virtual environment

    python -m venv .venv
    .venv\Scripts\activate    # Windows cmd/powershell

2. Install dependencies

    pip install -r requirements.txt

3. Download spaCy model (example):

    python -m spacy download en_core_web_sm

4. Run the service

    uvicorn app:app --host 127.0.0.1 --port 8000 --workers 1

Notes:
- The service uses a simple rule-based "intent" placeholder. Replace with a trained spaCy textcat model or another classifier for production.
- For production consider running with multiple workers and/or behind a process manager or container orchestrator. Loading a spaCy model in multiple workers duplicates memory; consider external shared service or model server if memory is constrained.
- Endpoints:
  - POST /parse  { text }
  - POST /classify { text }
  - GET /health

