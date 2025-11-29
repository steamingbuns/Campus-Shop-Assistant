#!/bin/bash
# NLP Service Setup Script for macOS/Linux
# This script automates the setup of the Python NLP service

echo "========================================"
echo " Campus Shop Assistant - NLP Service Setup"
echo "========================================"
echo

cd "$(dirname "$0")"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed."
    echo "Please install Python 3.9+ from https://python.org"
    exit 1
fi

echo "[1/4] Creating virtual environment..."
# Support both venv and .venv folder names
if [ -f ".venv/bin/activate" ]; then
    echo "Virtual environment (.venv) already exists, skipping..."
    VENV_DIR=".venv"
elif [ -f "venv/bin/activate" ]; then
    echo "Virtual environment (venv) already exists, skipping..."
    VENV_DIR="venv"
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to create virtual environment"
        exit 1
    fi
    VENV_DIR="venv"
fi

echo "[2/4] Activating virtual environment..."
source $VENV_DIR/bin/activate

echo "[3/4] Installing dependencies..."
pip install -r requirements.txt --quiet
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi

echo "[4/4] Setting up spaCy model..."
# Check if trained model exists (priority: models/best > models/campus_shop_nlp)
if [ -f "models/best/meta.json" ]; then
    echo "Production model found: models/best"
    echo "Using production model for best accuracy."
elif [ -f "models/campus_shop_nlp/meta.json" ]; then
    echo "Custom trained model found: models/campus_shop_nlp"
    echo "Using custom model for best accuracy."
else
    echo "No trained model found. Downloading en_core_web_sm as fallback..."
    python -m spacy download en_core_web_sm --quiet
    if [ $? -ne 0 ]; then
        echo "[WARNING] Failed to download spaCy model. Will use regex fallback."
    fi
fi

echo
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo
echo "To start the NLP service, run:"
echo "  npm run nlp:start"
echo
echo "Model priority:"
echo "  1. models/campus_shop_nlp (custom trained - best accuracy)"
echo "  2. en_core_web_sm (generic English model)"
echo "  3. Regex fallback (if NLP service unavailable)"
echo
