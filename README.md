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

## How to Use

Once both the backend and frontend are running, follow these steps to manage your job applications and generate motivation letters:

### 1. Configure Settings
Before making any applications, click on the **Settings** (gear icon) on the top right:
- **API Key**: Select your preferred AI Provider (Gemini, OpenAI, or Claude) and enter the respective API Key. 
  - *Security Note*: Your API Key is **never** saved to a database or file. It is securely stored only in your browser's local memory (`localStorage`).
- **Save Path**: Enter the absolute folder path on your computer where you want the generated Word (`.docx`) motivation letters to be automatically downloaded (e.g., `C:\Users\Name\Desktop\CoverLetters`).

### 2. Upload Reference Documents
In the top navigation bar, you need to upload your base reference files for the AI to analyze:
- **CV (Resume)**: Click "Upload CV" to provide your resume. 
- **Sample Letter**: Click "Sample Letter" to provide an example of your writing style. There is already a `sample.txt` provided in the background architecture, but you can overwrite it with your own.
- *Format Restriction*: You must upload these files in **`.txt` or `.md` (Markdown)** format. PDF and Word documents often contain hidden formatting, tables, or invisible characters that confuse the AI's reading comprehension. Providing raw text ensures the AI generates the most accurate and high-quality letter possible.

### 3. Dashboard and Filtering
The main dashboard serves as your mission control for job tracking:
- **New Application**: Click "New Application" to paste a job description. The AI will instantly analyze the job, compare it against your uploaded CV, and extract key details like the Job Title, Company Name, Location, and Language Requirements.
- **Compatibility Score**: The AI will assign a match score (0-100%) indicating how well your CV aligns with the job description.
- **Filtering & Sorting**: Use the top bar to filter your applications by status (e.g., *Interview*, *Rejected*, *Applied*) or sort them from highest to lowest compatibility score, allowing you to prioritize the jobs you have the best chance of securing.
- **Letter Generation**: Expand any job card and click **"Create Motivation Letter"**. The AI will draft a highly tailored letter bridging your CV with the job description, which you can then download as a Word document to your configured Save Path.
