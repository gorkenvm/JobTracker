#!/bin/bash
echo "========================================="
echo "      Starting JobTracker"
echo "========================================="
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 is not installed. Please install Python 3."
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] node is not installed. Please install Node.js."
    exit 1
fi

# Start Backend
echo "[*] Setting up Backend API..."
cd backend || exit
if [ ! -d "venv" ]; then
    echo "[INFO] Creating Python virtual environment..."
    python3 -m venv venv
fi
echo "[INFO] Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt
echo "[INFO] Starting FastAPI server in background..."
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

# Start Frontend
echo ""
echo "[*] Setting up Frontend Interface..."
cd frontend || exit
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing Node modules..."
    npm install
fi
echo "[INFO] Starting React development server in background..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================="
echo "JobTracker is starting up!"
echo ""
echo "Backend API is running at: http://localhost:8000"
echo "Frontend UI is running at: http://localhost:5173"
echo "========================================="
echo "Press Ctrl+C to stop both servers."

# Wait for background processes
wait $BACKEND_PID
wait $FRONTEND_PID
