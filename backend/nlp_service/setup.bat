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
REM Support both venv and .venv folder names
if exist ".venv\Scripts\activate.bat" (
    echo Virtual environment .venv already exists, skipping...
    set VENV_DIR=.venv
    goto :activate_venv
)
if exist "venv\Scripts\activate.bat" (
    echo Virtual environment venv already exists, skipping...
    set VENV_DIR=venv
    goto :activate_venv
)
echo Creating new virtual environment...
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    exit /b 1
)
set VENV_DIR=venv

:activate_venv
echo [2/4] Activating virtual environment...
call %VENV_DIR%\Scripts\activate.bat

echo [3/4] Installing dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [4/4] Setting up spaCy model...
REM Check if trained model exists (priority: models/best > models/campus_shop_nlp)
if exist "models\best\meta.json" (
    echo Production model found: models/best
    echo Using production model for best accuracy.
    goto :setup_done
)
if exist "models\campus_shop_nlp\meta.json" (
    echo Custom trained model found: models/campus_shop_nlp
    echo Using custom model for best accuracy.
    goto :setup_done
)
echo No trained model found. Downloading en_core_web_sm as fallback...
python -m spacy download en_core_web_sm --quiet
if errorlevel 1 (
    echo [WARNING] Failed to download spaCy model. Will use regex fallback.
)

:setup_done
echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo To start the NLP service, run:
echo   start.bat
echo.
echo Model priority:
echo   1. models/best (production model)
echo   2. models/campus_shop_nlp (custom trained)
echo   3. en_core_web_sm (generic English model)
echo   4. Regex fallback (if NLP service unavailable)
echo.
