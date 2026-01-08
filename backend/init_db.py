#!/usr/bin/env python3
"""
Database initialization script for WikiQuiz AI.
Creates all necessary tables and optionally seeds sample data.
"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from database import Base, engine
from models import Quiz
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db():
    """Initialize database tables."""
    logger.info("Creating database tables...")
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully!")
        logger.info("Tables created: quizzes")
        return True
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        return False


def check_db_connection():
    """Check if database connection is working."""
    logger.info("Checking database connection...")
    
    try:
        # Try to connect
        connection = engine.connect()
        connection.close()
        logger.info("✅ Database connection successful!")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        logger.error("Please check your DATABASE_URL in .env file")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("WikiQuiz AI - Database Initialization")
    print("=" * 60)
    print()
    
    # Check connection first
    if not check_db_connection():
        sys.exit(1)
    
    # Initialize tables
    if not init_db():
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("✅ Database setup complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Start the backend: uvicorn main:app --reload")
    print("2. Start the frontend: npm run dev")
    print("3. Open http://localhost:5173 in your browser")
    print()
