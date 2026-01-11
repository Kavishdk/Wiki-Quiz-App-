import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

# Debug check
if not os.path.exists(".env"):
    print("DEBUG: .env file NOT FOUND in backend directory!")
else:
    print("DEBUG: .env file found.")

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/wikiquiz"
    GEMINI_API_KEY: str
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:3001"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra="ignore")


settings = Settings()
