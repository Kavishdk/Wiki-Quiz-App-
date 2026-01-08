"""
SQLAlchemy database models for WikiQuiz application.
"""
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from database import Base


class Quiz(Base):
    """
    Quiz model storing Wikipedia article data and generated quizzes.
    
    Stores:
    - Article metadata (URL, title, summary)
    - Extracted entities and sections
    - Generated quiz questions
    - Related topics
    - Raw HTML for reference (bonus feature)
    """
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    
    # Structured data as JSON
    key_entities = Column(JSON, nullable=True)
    sections = Column(JSON, nullable=True)
    quiz = Column(JSON, nullable=False)
    related_topics = Column(JSON, nullable=True)
    
    # Bonus: Store raw HTML for reference
    raw_html = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Quiz(id={self.id}, title='{self.title}', url='{self.url}')>"
