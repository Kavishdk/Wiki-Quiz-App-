"""
WikiQuiz Generator - Main API
Built with FastAPI for the DeepKlarity assignment
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import logging
import traceback

from config import settings
from database import engine, get_db, Base
from models import Quiz
from schemas import (
    QuizGenerateRequest,
    QuizResponse,
    QuizHistoryItem,
    ErrorResponse,
    KeyEntities
)
from scraper import scrape_wikipedia
from llm import generate_quiz_from_content, extract_entities_from_content

# Setup logging - helps with debugging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Make sure DB tables exist
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")
    raise

# Create the FastAPI app
app = FastAPI(
    title="WikiQuiz AI - Smart Trivia Generator",
    description="Generate AI-powered quizzes from Wikipedia articles",
    version="1.0.0"
)


# Setup CORS so frontend can talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Global Error Handlers ---

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle invalid data sent to API"""
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            detail=f"Invalid data provided: {exc}",
            timestamp=None  # We could add timestamp if needed
        ).model_dump(exclude_none=True),
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    """Handle standard HTTP exceptions with consistent format"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            detail=str(exc.detail),
            timestamp=None
        ).model_dump(exclude_none=True),
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Catch-all for any unhandled server errors"""
    logger.error(f"Global exception: {exc}")
    logger.error(traceback.format_exc())
    
    # Specific message for Google API rate limits if they bubble up
    if "ResourceExhausted" in str(exc) or "429" in str(exc):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=ErrorResponse(
                detail="AI service is busy (Quota Exceeded). Please try again in a few minutes."
            ).model_dump(exclude_none=True),
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            detail="An unexpected server error occurred."
        ).model_dump(exclude_none=True),
    )



@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "WikiQuiz AI API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "generate": "/api/generate",
            "history": "/api/history",
            "quiz": "/api/quiz/{id}",
            "preview": "/api/preview",
            "docs": "/docs"
        }
    }


@app.post(
    "/api/generate",
    response_model=QuizResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid URL or scraping error"},
        500: {"model": ErrorResponse, "description": "Server error"}
    }
)
async def generate_quiz(
    request: QuizGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Main endpoint - takes a Wikipedia URL and generates a quiz from it.
    
    This does the heavy lifting:
    1. Checks if we've already processed this URL (saves time and API costs!)
    2. Scrapes the Wikipedia page
    3. Uses Gemini to extract entities
    4. Generates quiz questions with the LLM
    5. Saves everything to the database
    """
    url_str = str(request.url)
    
    try:
        # Check if we already have this one - no point doing the work twice
        existing_quiz = db.query(Quiz).filter(Quiz.url == url_str).first()
        if existing_quiz:
            logger.info(f"Found existing quiz for {url_str}, returning cached version")
            return existing_quiz
    except SQLAlchemyError as e:
        logger.error(f"Database error while checking for existing quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred while checking cache"
        )
    
    try:
        # Step 1: Grab the Wikipedia content
        logger.info(f"Starting to scrape: {url_str}")
        try:
            scraped_data = scrape_wikipedia(url_str)
        except ValueError as e:
            # Invalid URL format
            logger.warning(f"Invalid Wikipedia URL: {url_str} - {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid Wikipedia URL: {str(e)}"
            )
        except requests.exceptions.Timeout:
            logger.error(f"Timeout while scraping {url_str}")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Wikipedia took too long to respond. Please try again."
            )
        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error while scraping {url_str}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not connect to Wikipedia. Please check your internet connection."
            )
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error while scraping {url_str}: {e}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to fetch Wikipedia article: {str(e)}"
            )
        
        # Step 2: Pull out the important entities (people, places, orgs)
        logger.info("Extracting entities from the article...")
        try:
            entities = extract_entities_from_content(scraped_data['full_content'])
        except Exception as e:
            # Entity extraction is not critical - we can continue without it
            logger.warning(f"Entity extraction failed, continuing anyway: {e}")
            entities = {"people": [], "organizations": [], "locations": []}
        
        # Step 3: Generate the actual quiz questions
        logger.info("Generating quiz questions with Gemini...")
        try:
            quiz_data = generate_quiz_from_content(
                title=scraped_data['title'],
                content=scraped_data['full_content'],
                sections=scraped_data['sections']
            )
        except ValueError as e:
            # LLM parsing error
            logger.error(f"Failed to parse LLM response: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI failed to generate valid quiz. Please try again."
            )
        except Exception as e:
            # General LLM error
            logger.error(f"LLM error during quiz generation: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI service error: {str(e)}"
            )
        
        # Validate quiz data
        if not quiz_data.get('quiz') or len(quiz_data['quiz']) == 0:
            logger.error("LLM generated empty quiz")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI generated an empty quiz. Please try again."
            )
        
        # Step 4: Save it all to the database
        logger.info("Saving to database...")
        try:
            new_quiz = Quiz(
                url=url_str,
                title=scraped_data['title'],
                summary=scraped_data['summary'],
                key_entities=entities,
                sections=scraped_data['sections'],
                quiz=quiz_data['quiz'],
                related_topics=quiz_data.get('related_topics', []),
                raw_html=scraped_data['raw_html']
            )
            
            db.add(new_quiz)
            db.commit()
            db.refresh(new_quiz)
            
            logger.info(f"Successfully generated quiz for: {scraped_data['title']}")
            return new_quiz
            
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error while saving quiz: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save quiz to database"
            )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Unexpected error generating quiz: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )


@app.get(
    "/api/history",
    response_model=List[QuizHistoryItem],
    status_code=status.HTTP_200_OK
)
async def get_history(db: Session = Depends(get_db)):
    """
    Get all the quizzes we've generated so far.
    Returns them newest first.
    """
    try:
        quizzes = db.query(Quiz).order_by(Quiz.created_at.desc()).all()
        logger.info(f"Retrieved {len(quizzes)} quizzes from history")
        return quizzes
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch quiz history from database"
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching history: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching history"
        )


@app.get(
    "/api/quiz/{quiz_id}",
    response_model=QuizResponse,
    status_code=status.HTTP_200_OK,
    responses={
        404: {"model": ErrorResponse, "description": "Quiz not found"}
    }
)
async def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """
    Get a specific quiz by its ID.
    Used when someone clicks "Details" in the history tab.
    """
    # Validate quiz_id
    if quiz_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid quiz ID. Must be a positive integer."
        )
    
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        
        if not quiz:
            logger.warning(f"Quiz with ID {quiz_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quiz with ID {quiz_id} not found"
            )
        
        logger.info(f"Retrieved quiz {quiz_id}: {quiz.title}")
        return quiz
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching quiz {quiz_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch quiz from database"
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching quiz {quiz_id}: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching quiz"
        )


@app.get("/api/preview")
async def preview_url(url: str):
    """
    Quick preview of a Wikipedia article - just grabs the title.
    Useful for showing users what they're about to generate a quiz for.
    """
    if not url or not url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL parameter is required"
        )
    
    try:
        scraped_data = scrape_wikipedia(url)
        logger.info(f"Previewed article: {scraped_data['title']}")
        return {
            "title": scraped_data['title'],
            "url": url
        }
    except ValueError as e:
        logger.warning(f"Invalid URL for preview: {url} - {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Wikipedia URL: {str(e)}"
        )
    except requests.exceptions.Timeout:
        logger.error(f"Timeout while previewing {url}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Wikipedia took too long to respond"
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error while previewing {url}: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch Wikipedia article: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error previewing URL {url}: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while previewing URL"
        )


@app.delete("/api/quiz/{quiz_id}")
async def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """
    Delete a quiz - in case someone wants to clean up their history.
    """
    # Validate quiz_id
    if quiz_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid quiz ID. Must be a positive integer."
        )
    
    try:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        
        if not quiz:
            logger.warning(f"Attempted to delete non-existent quiz {quiz_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quiz with ID {quiz_id} not found"
            )
        
        quiz_title = quiz.title
        db.delete(quiz)
        db.commit()
        
        logger.info(f"Deleted quiz {quiz_id}: {quiz_title}")
        return {"message": f"Quiz '{quiz_title}' deleted successfully"}
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error deleting quiz {quiz_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete quiz from database"
        )
    except Exception as e:
        logger.error(f"Unexpected error deleting quiz {quiz_id}: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting quiz"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
