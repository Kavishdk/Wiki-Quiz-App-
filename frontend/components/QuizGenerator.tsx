
import React, { useState } from 'react';
import { generateQuiz, QuizData } from '../services/api';
import QuizDisplay from './QuizDisplay';
import URLPreview from './URLPreview';
import { useToast } from './ToastContext';

interface QuizGeneratorProps {
  onQuizGenerated: (data: QuizData) => void;
}

// Quick check for valid Wikipedia URLs
const isValidWikiUrl = (url: string): boolean => {
  return /^https?:\/\/(en\.)?wikipedia\.org\/wiki\/[^:]+$/.test(url);
};

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onQuizGenerated }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QuizData | null>(null);
  const [validatedTitle, setValidatedTitle] = useState('');
  const { showToast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Make sure they gave us a valid URL
    if (!isValidWikiUrl(url)) {
      showToast('Please enter a valid Wikipedia article URL (e.g., https://en.wikipedia.org/wiki/React)', 'error');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Call our backend API to do the heavy lifting
      const generated = await generateQuiz(url);

      setResult(generated);
      setValidatedTitle(generated.title);
      onQuizGenerated(generated);
      showToast('Quiz generated successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'Something went wrong while generating the quiz.';
      showToast(errorMessage, 'error');
      // We don't specific local error state anymore, using toast instead
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create a New Quiz</h2>
        <p className="text-slate-500 mb-6">Paste a Wikipedia link to automatically extract content and build a custom quiz.</p>

        <form onSubmit={handleGenerate} className="flex flex-col space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <i className="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://en.wikipedia.org/wiki/..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center min-w-[160px] ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </div>

          <URLPreview url={url} onValidated={setValidatedTitle} />
        </form>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <i className="fas fa-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600"></i>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-700 text-lg">AI is reading the article...</h3>
            <p className="text-slate-500">Creating questions for {validatedTitle || "the article"}.</p>
          </div>
        </div>
      )}

      {result && <QuizDisplay data={result} />}
    </div>
  );
};

export default QuizGenerator;
