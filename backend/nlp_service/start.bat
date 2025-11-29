@echo off
REM Start NLP Service Script for Windows
cd /d "%~dp0"

if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found. Run setup.bat first.
    exit /b 1
)

call venv\Scripts\activate.bat

REM Use custom model if available, otherwise fallback to en_core_web_sm
if exist "models\campus_shop_nlp\meta.json" (
    echo Using custom trained model: models/campus_shop_nlp
    set SPACY_MODEL=models/campus_shop_nlp
) else (
    echo Using fallback model: en_core_web_sm
    set SPACY_MODEL=en_core_web_sm
)

echo Starting NLP service on http://127.0.0.1:5001...
uvicorn app:app --host 127.0.0.1 --port 5001 --reload
