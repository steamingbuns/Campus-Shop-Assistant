@echo off
REM Start NLP Service Script for Windows
cd /d "%~dp0"

REM Support both venv and .venv folder names
if exist ".venv\Scripts\activate.bat" (
    set VENV_DIR=.venv
    goto :found_venv
)
if exist "venv\Scripts\activate.bat" (
    set VENV_DIR=venv
    goto :found_venv
)
echo [ERROR] Virtual environment not found. Run setup.bat first.
exit /b 1

:found_venv
call %VENV_DIR%\Scripts\activate.bat

REM Model priority: models/best > models/campus_shop_nlp > en_core_web_sm
if exist "models\best\meta.json" (
    echo Using production model: models/best
    set SPACY_MODEL=models/best
    goto :start_server
)
if exist "models\campus_shop_nlp\meta.json" (
    echo Using custom trained model: models/campus_shop_nlp
    set SPACY_MODEL=models/campus_shop_nlp
    goto :start_server
)
echo Using fallback model: en_core_web_sm
set SPACY_MODEL=en_core_web_sm

:start_server
echo Starting NLP service on http://127.0.0.1:5001...
uvicorn app:app --host 127.0.0.1 --port 5001 --reload
