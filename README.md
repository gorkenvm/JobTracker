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
* **SQLAlchemy & PostgreSQL** (for reliable relational database management)
* **Pydantic** (for strict data validation)
* **Python-dotenv** (for environment variable management)
* **OpenAI & Google Generative AI SDKs** (for LLM integration)
* **Python-docx & pdfkit** (for exporting generated letters to standardized document formats)
