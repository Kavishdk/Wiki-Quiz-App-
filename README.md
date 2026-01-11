# WikiQuiz AI - Smart Trivia Generator

Turn any Wikipedia article into an interactive quiz using AI. Built for the DeepKlarity Technologies assignment.

## What It Does

Give it a Wikipedia URL, and it'll scrape the article, use Google's Gemini AI to generate quiz questions, and save everything to a database. You get a clean interface with two tabs - one for generating new quizzes and another to view your history.

## Quick Demo

1. Paste a Wikipedia URL (like `https://en.wikipedia.org/wiki/Alan_Turing`)
2. Click "Generate Quiz"
3. Get 7-10 questions with different difficulty levels
4. See related topics to explore next
5. Check your history anytime

## Tech Stack

**Backend:**
- Python with FastAPI
- PostgreSQL database
- BeautifulSoup for scraping (no Wikipedia API)
- Google Gemini via LangChain for quiz generation

**Frontend:**
- React with TypeScript
- Vite for fast builds
- Clean, minimal UI

## Getting Started

### What You Need

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- A Gemini API key (free tier works fine)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and add your credentials:
```
DATABASE_URL=postgresql://user:password@localhost:5432/wikiquiz
GEMINI_API_KEY=your_gemini_api_key_here
```

Initialize the database:
```bash
python init_db.py
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs at `http://localhost:5173`

## Features

### Core Stuff
- ✅ Scrapes Wikipedia articles (HTML parsing only)
- ✅ Generates 7-10 quiz questions with AI
- ✅ Three difficulty levels (easy, medium, hard)
- ✅ Extracts key entities (people, places, organizations)
- ✅ Suggests 5 related topics
- ✅ Saves everything to PostgreSQL
- ✅ History view with all past quizzes

### Bonus Features
- ✅ Interactive "Take Quiz" mode with scoring
- ✅ URL preview (shows article title before generating)
- ✅ Caching (won't process the same URL twice)
- ✅ Questions grouped by article sections
- ✅ Raw HTML storage for reference

## API Endpoints

The backend exposes these endpoints:

- `POST /api/generate` - Generate a quiz from a Wikipedia URL
- `GET /api/history` - Get all quiz history
- `GET /api/quiz/{id}` - Get a specific quiz
- `GET /api/preview` - Preview a Wikipedia article title
- `DELETE /api/quiz/{id}` - Delete a quiz

Full API docs available at `http://localhost:8000/docs` when running.

## How the AI Works

The prompts are carefully designed to:
- Only use information from the article (no hallucinations)
- Create diverse question types
- Balance difficulty levels
- Provide explanations for each answer

Check out `PROMPT_TEMPLATES.md` for the full prompt engineering details.

## Project Structure

```
├── backend/          # Python FastAPI backend
├── frontend/         # React frontend application
├── screenshots/      # Verified UI screenshots
├── sample_data/      # Test URLs and example output
└── docs/             # Setup and deployment guides
```

## Sample Data

Try these Wikipedia articles:
- Alan Turing
- Artificial Intelligence
- Marie Curie
- World War II
- Python (programming language)

See `sample_data/test_urls.txt` for more examples.

## Deployment

Want to deploy this? Check out `DEPLOYMENT.md` for step-by-step instructions for:
- Render (backend + database)
- Vercel (frontend)

## Troubleshooting

**Database connection fails?**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env`

**Gemini API errors?**
- Verify your API key is correct
- Check you haven't hit rate limits

**Frontend can't reach backend?**
- Make sure backend is running on port 8000
- Check CORS settings in `backend/main.py`

More help in `SETUP_GUIDE.md`.

## What Makes This Different

- **No hallucinations**: Questions are strictly based on article content
- **Smart caching**: Won't waste API calls on duplicate URLs
- **Production-ready**: Proper error handling throughout
- **Clean code**: Type-safe with Python type hints and TypeScript
- **Well documented**: Clear setup guides and prompt templates

## License

MIT - feel free to use this for learning or your own projects.

## Built With

This was built as a submission for the DeepKlarity Technologies AI Wiki Quiz Generator assignment. It demonstrates full-stack development, LLM integration, and production-ready code practices.

---

**Repository**: https://github.com/Kavishdk/Wiki-Quiz-App-  
**Questions?** Check the docs or open an issue.
