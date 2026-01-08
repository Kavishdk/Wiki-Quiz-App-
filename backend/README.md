# WikiQuiz AI - Backend

Python FastAPI backend for WikiQuiz AI application.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Your Google Gemini API key
- `CORS_ORIGINS` - Allowed frontend origins (comma-separated)

### 3. Initialize Database
```bash
python init_db.py
```

### 4. Run Server
```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

- `POST /api/generate` - Generate quiz from Wikipedia URL
- `GET /api/history` - Get all quiz history
- `GET /api/quiz/{id}` - Get specific quiz
- `GET /api/preview` - Preview Wikipedia article
- `DELETE /api/quiz/{id}` - Delete quiz

## Interactive Documentation

Visit http://localhost:8000/docs for Swagger UI documentation.

## Architecture

```
main.py          - FastAPI application and routes
config.py        - Configuration management
database.py      - Database connection and session
models.py        - SQLAlchemy database models
schemas.py       - Pydantic validation schemas
scraper.py       - Wikipedia scraping logic
llm.py           - LLM integration for quiz generation
init_db.py       - Database initialization script
```

## Key Features

- **Robust Error Handling** - Comprehensive error handling for all edge cases
- **Caching** - Prevents duplicate scraping of the same URL
- **Logging** - Detailed logging for debugging and monitoring
- **Type Safety** - Full Pydantic validation for requests/responses
- **CORS** - Configurable CORS for frontend integration

## Testing

```bash
# Test with sample URLs
curl -X POST "http://localhost:8000/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org/wiki/Alan_Turing"}'
```

## Deployment

See main README.md for deployment instructions.
