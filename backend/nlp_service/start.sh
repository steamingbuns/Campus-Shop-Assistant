#!/bin/bash
# Start NLP Service Script for macOS/Linux
cd "$(dirname "$0")"

# Support both venv and .venv folder names
if [ -f ".venv/bin/activate" ]; then
    VENV_DIR=".venv"
elif [ -f "venv/bin/activate" ]; then
    VENV_DIR="venv"
else
    echo "[ERROR] Virtual environment not found. Run setup.sh first."
    exit 1
fi

source $VENV_DIR/bin/activate

# Model priority: models/best > models/campus_shop_nlp > en_core_web_sm
if [ -f "models/best/meta.json" ]; then
    echo "Using production model: models/best"
    export SPACY_MODEL=models/best
elif [ -f "models/campus_shop_nlp/meta.json" ]; then
    echo "Using custom trained model: models/campus_shop_nlp"
    export SPACY_MODEL=models/campus_shop_nlp
else
    echo "Using fallback model: en_core_web_sm"
    export SPACY_MODEL=en_core_web_sm
fi

echo "Starting NLP service on http://127.0.0.1:5001..."
uvicorn app:app --host 127.0.0.1 --port 5001 --reload
