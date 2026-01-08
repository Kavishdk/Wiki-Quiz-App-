/**
 * API service for WikiQuiz backend
 * Connects to Python FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export interface KeyEntities {
  people: string[];
  organizations: string[];
  locations: string[];
}

export interface QuizData {
  id: number;
  url: string;
  title: string;
  summary: string;
  key_entities?: KeyEntities;
  sections: string[];
  quiz: QuizQuestion[];
  related_topics: string[];
  created_at?: string;
}

export interface QuizHistoryItem {
  id: number;
  url: string;
  title: string;
  created_at?: string;
}

export interface URLPreview {
  title: string;
  url: string;
}

// Custom error class for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // Can't parse error response, use status text
    }

    throw new APIError(errorMessage, response.status);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new APIError('Failed to parse server response');
  }
}

// Helper to handle network errors
function handleNetworkError(error: any): never {
  if (error instanceof APIError) {
    throw error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new APIError(
      'Cannot connect to server. Please check your internet connection.',
      0
    );
  }

  throw new APIError(error.message || 'An unexpected error occurred');
}

/**
 * Generate quiz from Wikipedia URL
 */
export async function generateQuiz(url: string): Promise<QuizData> {
  if (!url || !url.trim()) {
    throw new APIError('URL cannot be empty', 400);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    return await handleResponse<QuizData>(response);
  } catch (error) {
    return handleNetworkError(error);
  }
}

/**
 * Get quiz history
 */
export async function getQuizHistory(): Promise<QuizHistoryItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`);
    return await handleResponse<QuizHistoryItem[]>(response);
  } catch (error) {
    return handleNetworkError(error);
  }
}

/**
 * Get specific quiz by ID
 */
export async function getQuizById(id: number): Promise<QuizData> {
  if (!id || id <= 0) {
    throw new APIError('Invalid quiz ID', 400);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/quiz/${id}`);
    return await handleResponse<QuizData>(response);
  } catch (error) {
    return handleNetworkError(error);
  }
}

/**
 * Preview Wikipedia URL (bonus feature)
 */
export async function previewURL(url: string): Promise<URLPreview> {
  if (!url || !url.trim()) {
    throw new APIError('URL cannot be empty', 400);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/preview?url=${encodeURIComponent(url)}`
    );
    return await handleResponse<URLPreview>(response);
  } catch (error) {
    return handleNetworkError(error);
  }
}

/**
 * Delete quiz by ID
 */
export async function deleteQuiz(id: number): Promise<void> {
  if (!id || id <= 0) {
    throw new APIError('Invalid quiz ID', 400);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/quiz/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ message: string }>(response);
  } catch (error) {
    return handleNetworkError(error);
  }
}
