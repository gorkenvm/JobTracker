@echo off
echo =========================================
echo       Starting JobTracker
echo =========================================
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.
    pause
    exit /b 1
)

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js.
    pause
    exit /b 1
)

:: Start Backend
echo [*] Setting up Backend API...
cd backend
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)
echo [INFO] Activating virtual environment and installing dependencies...
call .\venv\Scripts\activate
pip install -r requirements.txt
echo [INFO] Starting FastAPI server...
start "JobTracker Backend (Do not close this window)" cmd /k ".\venv\Scripts\activate && uvicorn main:app --reload"
cd ..

:: Start Frontend
echo.
echo [*] Setting up Frontend Interface...
cd frontend
if not exist "node_modules" (
    echo [INFO] Installing Node modules...
    call npm install
)
echo [INFO] Starting React development server...
start "JobTracker Frontend (Do not close this window)" cmd /k "npm run dev"
cd ..

echo.
echo =========================================
echo JobTracker is starting up!
echo.
echo Backend API will be available at: http://localhost:8000
echo Frontend UI will be available at: http://localhost:5173 
echo (The frontend might take a few seconds to load)
echo =========================================
pause
