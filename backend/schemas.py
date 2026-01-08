"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Dict, Optional
from datetime import datetime


class QuizQuestion(BaseModel):
    """Schema for a single quiz question."""
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    answer: str
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    explanation: str


class KeyEntities(BaseModel):
    """Schema for extracted entities from article."""
    people: List[str] = []
    organizations: List[str] = []
    locations: List[str] = []


class QuizGenerateRequest(BaseModel):
    """Request schema for quiz generation."""
    url: HttpUrl
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://en.wikipedia.org/wiki/Alan_Turing"
            }
        }


class QuizResponse(BaseModel):
    """Response schema for quiz data."""
    id: int
    url: str
    title: str
    summary: str
    key_entities: Optional[KeyEntities] = None
    sections: List[str]
    quiz: List[QuizQuestion]
    related_topics: List[str]
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class QuizHistoryItem(BaseModel):
    """Schema for quiz history list item."""
    id: int
    url: str
    title: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    error_type: Optional[str] = None
