@echo off
REM NLP Service Setup Script for Windows
REM This script automates the setup of the Python NLP service

echo ========================================
echo  Campus Shop Assistant - NLP Service Setup
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.9+ from https://python.org
    exit /b 1
)

echo [1/4] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        exit /b 1
    )
) else (
    echo Virtual environment already exists, skipping...
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [4/4] Setting up spaCy model...
REM Check if custom trained model exists
if exist "models\campus_shop_nlp\meta.json" (
    echo Custom trained model found: models/campus_shop_nlp
    echo Using custom model for best accuracy.
) else (
    echo Custom model not found. Downloading en_core_web_sm as fallback...
    python -m spacy download en_core_web_sm --quiet
    if errorlevel 1 (
        echo [WARNING] Failed to download spaCy model. Will use regex fallback.
    )
)

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To start the NLP service, run:
echo   npm run nlp:start
echo.
echo Model priority:
echo   1. models/campus_shop_nlp (custom trained - best accuracy)
echo   2. en_core_web_sm (generic English model)
echo   3. Regex fallback (if NLP service unavailable)
echo.
