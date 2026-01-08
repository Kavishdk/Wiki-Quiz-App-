
import React, { useState } from 'react';
import { Tab, WikiData } from './types';
import Header from './components/Header';
import QuizGenerator from './components/QuizGenerator';
import History from './components/History';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERATE);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleQuizGenerated = (data: WikiData) => {
    // Trigger history refresh when new quiz is generated
    setHistoryRefresh(prev => prev + 1);
    // Optionally switch to history tab to show the new quiz
    // setActiveTab(Tab.HISTORY);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab(Tab.GENERATE)}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === Tab.GENERATE
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Generate Quiz
            {activeTab === Tab.GENERATE && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab(Tab.HISTORY)}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === Tab.HISTORY
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Past Quizzes
            {activeTab === Tab.HISTORY && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === Tab.GENERATE ? (
          <QuizGenerator onQuizGenerated={handleQuizGenerated} />
        ) : (
          <History refreshTrigger={historyRefresh} />
        )}
      </main>

      <footer className="py-6 border-t border-slate-200 bg-white text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} WikiQuiz AI. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
