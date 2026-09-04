# CreatorIQ Backend API Engine

FastAPI-powered high-performance analytics backend supporting multi-platform telemetry across YouTube, Instagram, TikTok, LinkedIn, X, and Facebook.

## Setup & Running Locally

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI development server:
   ```bash
   python main.py
   # Or via uvicorn:
   uvicorn app.main:app --reload --port 8000
   ```

4. Open Swagger UI Documentation:
   - Interactive Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
