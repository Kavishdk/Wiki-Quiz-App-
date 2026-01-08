
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <i className="fas fa-brain text-xl"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            WikiQuiz AI
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-sm font-medium text-slate-500">
          <span className="flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            Accurate Extraction
          </span>
          <span className="flex items-center">
            <i className="fas fa-bolt text-yellow-500 mr-2"></i>
            Instant Quizzes
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
