# JobTracker

JobTracker is a comprehensive application designed to streamline and manage the job application process. It provides users with an intuitive interface to track their applications while leveraging the power of modern Generative AI to assist in creating tailored cover letters (motivation letters).

## Features
* **Dashboard & Tracking**: Manage applied jobs, company names, and application statuses in one place.
* **AI Cover Letter Generation**: Automatically generate and download tailored motivation letters (in PDF/DOCX formats) using LLMs (OpenAI, Google Gemini, Groq, Anthropic, etc.).
* **Statistics & Filtering**: View key metrics, filter applications by status, and sort by compatibility score.
* **Multi-Language Support**: i18n support for English and German.

## Technologies Used

### Frontend (User Interface)
The frontend is built for a fast, responsive, and modern user experience.
* **React 18** (with **Vite** for optimized builds and fast development)
* **Tailwind CSS** (for utility-first, highly customizable styling and responsive design)
* **Axios** (for seamless API communication)
* **Lucide React** (for clean and modern icons)

### Backend (API & Business Logic)
The backend provides robust data management and integrates with various AI models.
* **Python 3**
* **FastAPI & Uvicorn** (for a high-performance, asynchronous RESTful API)
* **SQLAlchemy & SQLite** (for reliable relational database management without complex setup)
* **Pydantic** (for strict data validation)
* **Python-dotenv** (for environment variable management)
* **OpenAI & Google Generative AI SDKs** (for LLM integration)
* **Python-docx & pdfkit** (for exporting generated letters to standardized document formats)

## Getting Started (Automated Installation)

We have created automated startup scripts so you don't need to manually install dependencies or configure environments.

### Requirements:
* **Python 3.x** installed and added to PATH.
* **Node.js** installed and added to PATH.

### For Windows Users:
1. Double click on `run-windows.bat` or run it from the command line:
   ```cmd
   .\run-windows.bat
   ```
2. The script will automatically create a Python virtual environment, install all backend requirements, install frontend Node modules, and start both the backend FastAPI server and the frontend React application.

### For Mac/Linux Users:
1. Make the script executable and run it:
   ```bash
   chmod +x run-mac-linux.sh
   ./run-mac-linux.sh
   ```
2. The script will automatically handle all virtual environment creations, module installations, and start both servers.

*Backend API will run at `http://localhost:8000`*
*Frontend UI will run at `http://localhost:5173`*
