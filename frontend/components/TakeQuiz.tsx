
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface TakeQuizProps {
  quiz: QuizQuestion[];
  title: string;
  onBack: () => void;
}

const TakeQuiz: React.FC<TakeQuizProps> = ({ quiz, title, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz[currentIdx];

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    if (selectedOption === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 < quiz.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="inline-block p-4 rounded-full bg-blue-50 text-blue-600 mb-6">
            <i className="fas fa-trophy text-5xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 mb-8">You've mastered the article: <span className="font-semibold text-slate-800">{title}</span></p>
          
          <div className="flex justify-center items-end space-x-2 mb-8">
            <span className="text-6xl font-black text-blue-600">{score}</span>
            <span className="text-2xl text-slate-400 font-medium pb-2">/ {quiz.length}</span>
          </div>

          <div className="w-full bg-slate-100 h-4 rounded-full mb-10 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onBack}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Back to Details
            </button>
            <button 
              onClick={() => {
                setCurrentIdx(0);
                setSelectedOption(null);
                setIsSubmitted(false);
                setScore(0);
                setIsFinished(false);
              }}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-slate-500 hover:text-blue-600 font-medium flex items-center transition-colors">
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-400">Question</span>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
            {currentIdx + 1} / {quiz.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((currentIdx) / quiz.length) * 100}%` }}
          ></div>
        </div>

        <div className="p-8">
          <div className={`mb-4 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {currentQuestion.difficulty}
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-8 leading-snug">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4 mb-10">
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQuestion.answer;
              
              let bgColor = 'bg-white';
              let borderColor = 'border-slate-200';
              let textColor = 'text-slate-700';

              if (isSubmitted) {
                if (isCorrect) {
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-500';
                  textColor = 'text-green-800';
                } else if (isSelected) {
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-500';
                  textColor = 'text-red-800';
                } else {
                  bgColor = 'bg-slate-50';
                  borderColor = 'border-slate-100';
                  textColor = 'text-slate-400';
                }
              } else if (isSelected) {
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-600';
                textColor = 'text-blue-900';
              }

              return (
                <button
                  key={i}
                  disabled={isSubmitted}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all flex items-center group ${bgColor} ${borderColor} ${textColor} ${
                    !isSubmitted && 'hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <span className={`w-10 h-10 flex items-center justify-center rounded-xl mr-4 text-lg font-black transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-lg font-medium flex-grow">{opt}</span>
                  {isSubmitted && isCorrect && <i className="fas fa-check-circle text-green-500 text-xl ml-2"></i>}
                  {isSubmitted && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-500 text-xl ml-2"></i>}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Explanation</p>
              <p className="text-slate-700 leading-relaxed font-medium">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            {!isSubmitted ? (
              <button
                disabled={!selectedOption}
                onClick={handleSubmit}
                className={`px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
                  selectedOption 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg hover:-translate-y-1 flex items-center"
              >
                {currentIdx + 1 === quiz.length ? 'See Results' : 'Next Question'}
                <i className="fas fa-arrow-right ml-3"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
