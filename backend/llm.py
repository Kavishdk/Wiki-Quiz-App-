"""
LLM stuff for quiz generation using Gemini
This is where the magic happens - turning Wikipedia articles into quizzes
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List
from config import settings
import json


# Define what we want the quiz questions to look like
class QuizQuestionOutput(BaseModel):
    """Single quiz question structure"""
    question: str = Field(description="The quiz question text")
    options: List[str] = Field(description="Four answer options")
    answer: str = Field(description="The correct answer (must be one of the options)")
    difficulty: str = Field(description="Difficulty level: easy, medium, or hard")
    explanation: str = Field(description="Brief explanation of the answer")


class QuizOutput(BaseModel):
    """Complete quiz output with questions and related topics"""
    quiz: List[QuizQuestionOutput] = Field(description="List of 5-10 quiz questions")
    related_topics: List[str] = Field(description="5 related Wikipedia topics for further reading")


class EntityOutput(BaseModel):
    """Entities extracted from the article"""
    people: List[str] = Field(description="Names of people mentioned")
    organizations: List[str] = Field(description="Organizations mentioned")
    locations: List[str] = Field(description="Locations mentioned")


class QuizGenerator:
    """
    Handles all the LLM interactions for quiz generation.
    Using Gemini because it's free and works pretty well for this.
    """
    
    def __init__(self):
        # Setup Gemini - using lower temperature for more factual responses
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,  # keeping it low so we don't get creative with facts
            max_output_tokens=4096
        )
        
        # These parsers help us get structured JSON back
        self.quiz_parser = PydanticOutputParser(pydantic_object=QuizOutput)
        self.entity_parser = PydanticOutputParser(pydantic_object=EntityOutput)
    
    def generate_quiz(self, title: str, content: str, sections: List[str]) -> dict:
        """
        Main quiz generation function.
        
        The prompt here is really important - we need to make sure the LLM:
        1. Only uses info from the article (no making stuff up)
        2. Creates questions at different difficulty levels
        3. Gives us proper explanations
        
        Raises:
            ValueError: If LLM response cannot be parsed or is invalid
            Exception: For API errors
        """
        
        # Validate inputs
        if not title or not title.strip():
            raise ValueError("Article title cannot be empty")
        if not content or not content.strip():
            raise ValueError("Article content cannot be empty")
        if not sections:
            sections = ["General"]  # Fallback if no sections
        
        # This is the prompt that does all the work
        quiz_prompt = PromptTemplate(
            template="""You are an expert educational quiz generator. Your task is to create a high-quality quiz based STRICTLY on the provided Wikipedia article content.

CRITICAL RULES:
1. ALL questions MUST be answerable from the provided content
2. DO NOT add information not present in the article
3. Generate 7-10 questions with varied difficulty levels
4. Ensure factual accuracy - verify each answer against the content
5. Create diverse question types (factual, analytical, chronological)

Article Title: {title}

Article Sections: {sections}

Article Content:
{content}

Generate a quiz with the following requirements:

QUIZ QUESTIONS (7-10 questions):
- Mix of difficulty levels: 3-4 easy, 3-4 medium, 2-3 hard
- Easy: Direct facts from the article
- Medium: Require understanding and connection of concepts
- Hard: Require synthesis of multiple sections or deeper analysis
- Each question must have exactly 4 options
- The correct answer must be one of the 4 options
- Provide a brief explanation citing the relevant section

RELATED TOPICS (exactly 5):
- Suggest 5 related Wikipedia topics for further reading
- Topics should be naturally related to the article subject
- Use proper Wikipedia article naming conventions

{format_instructions}

IMPORTANT: Return ONLY valid JSON matching the schema. No additional text.""",
            input_variables=["title", "content", "sections"],
            partial_variables={"format_instructions": self.quiz_parser.get_format_instructions()}
        )
        
        try:
            # Actually call the LLM
            prompt_value = quiz_prompt.format(
                title=title,
                content=content[:8000],  # trim to avoid hitting token limits
                sections=", ".join(sections)
            )
            
            print(f"Calling Gemini API for quiz generation...")
            response = self.llm.invoke(prompt_value)
            
            if not response or not response.content:
                raise ValueError("LLM returned empty response")
            
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            raise Exception(f"Failed to call AI service: {str(e)}")
        
        # Parse the response - sometimes Gemini wraps it in markdown code blocks
        try:
            response_text = response.content.strip()
            
            if not response_text:
                raise ValueError("LLM returned empty content")
            
            # Clean up any markdown formatting
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
            
            quiz_output = json.loads(response_text)
            
            # Validate the output
            if not isinstance(quiz_output, dict):
                raise ValueError("LLM response is not a valid JSON object")
            
            if 'quiz' not in quiz_output:
                raise ValueError("LLM response missing 'quiz' field")
            
            if not isinstance(quiz_output['quiz'], list):
                raise ValueError("'quiz' field must be a list")
            
            if len(quiz_output['quiz']) == 0:
                raise ValueError("LLM generated empty quiz")
            
            # Validate each question
            for i, q in enumerate(quiz_output['quiz']):
                if not isinstance(q, dict):
                    raise ValueError(f"Question {i+1} is not a valid object")
                
                required_fields = ['question', 'options', 'answer', 'difficulty', 'explanation']
                for field in required_fields:
                    if field not in q:
                        raise ValueError(f"Question {i+1} missing required field: {field}")
                
                if not isinstance(q['options'], list) or len(q['options']) != 4:
                    raise ValueError(f"Question {i+1} must have exactly 4 options")
                
                if q['answer'] not in q['options']:
                    raise ValueError(f"Question {i+1}: answer must be one of the options")
                
                if q['difficulty'] not in ['easy', 'medium', 'hard']:
                    raise ValueError(f"Question {i+1}: difficulty must be easy, medium, or hard")
            
            # Ensure related_topics exists
            if 'related_topics' not in quiz_output:
                quiz_output['related_topics'] = []
            
            print(f"Successfully generated {len(quiz_output['quiz'])} questions")
            return quiz_output
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Got this response: {response.content[:500]}...")
            raise ValueError(f"Failed to parse LLM response as JSON: {str(e)}")
        except ValueError:
            raise
        except Exception as e:
            print(f"Uh oh, parsing error: {e}")
            print(f"Got this response: {response.content[:500]}...")
            raise ValueError(f"Failed to parse LLM response: {str(e)}")
    
    def extract_entities(self, content: str) -> dict:
        """
        Pull out the important people, places, and organizations from the article.
        """
        
        entity_prompt = PromptTemplate(
            template="""Extract key entities from the following Wikipedia article content.

Identify and categorize:
- PEOPLE: Names of individuals mentioned
- ORGANIZATIONS: Companies, institutions, groups
- LOCATIONS: Countries, cities, places

Content:
{content}

{format_instructions}

Return ONLY valid JSON matching the schema.""",
            input_variables=["content"],
            partial_variables={"format_instructions": self.entity_parser.get_format_instructions()}
        )
        
        prompt_value = entity_prompt.format(content=content[:4000])
        response = self.llm.invoke(prompt_value)
        
        try:
            response_text = response.content.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
            
            entities = json.loads(response_text)
            return entities
        except Exception as e:
            print(f"Entity extraction failed: {e}")
            # Just return empty lists if it doesn't work
            return {"people": [], "organizations": [], "locations": []}


# Create a global instance we can use
quiz_generator = QuizGenerator()


def generate_quiz_from_content(title: str, content: str, sections: List[str]) -> dict:
    """
    Helper function to generate a quiz.
    Just wraps the QuizGenerator class for easier importing.
    """
    return quiz_generator.generate_quiz(title, content, sections)


def extract_entities_from_content(content: str) -> dict:
    """
    Helper function to extract entities.
    """
    return quiz_generator.extract_entities(content)
