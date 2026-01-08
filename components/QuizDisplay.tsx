
import React, { useState, useMemo } from 'react';
import { WikiData, QuizQuestion } from '../types';
import TakeQuiz from './TakeQuiz';

interface QuizDisplayProps {
  data: WikiData;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ data }) => {
  const [mode, setMode] = useState<'details' | 'take'>('details');

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, QuizQuestion[]> = {};
    data.quiz.forEach(q => {
      const section = q.section || 'General';
      if (!groups[section]) groups[section] = [];
      groups[section].push(q);
    });
    return groups;
  }, [data.quiz]);

  if (mode === 'take') {
    return <TakeQuiz quiz={data.quiz} title={data.title} onBack={() => setMode('details')} />;
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Article Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold leading-tight">{data.title}</h2>
            <a 
              href={data.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-100 text-sm hover:underline flex items-center mt-1"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Source: Wikipedia
            </a>
          </div>
          <button 
            onClick={() => setMode('take')}
            className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center"
          >
            <i className="fas fa-play mr-2"></i>
            Take Quiz
          </button>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Executive Summary</h3>
            <p className="text-slate-600 leading-relaxed text-lg">{data.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center text-sm uppercase tracking-wider">
                <i className="fas fa-users text-blue-500 mr-2"></i> People
              </h4>
              <div className="flex flex-wrap gap-2">
                {/* Ensure the array is treated as string[] for type safety */}
                {(data.key_entities.people as string[]).map((p, i) => (
                  <span key={i} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">{p}</span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center text-sm uppercase tracking-wider">
                <i className="fas fa-building text-indigo-500 mr-2"></i> Orgs
              </h4>
              <div className="flex flex-wrap gap-2">
                {/* Ensure the array is treated as string[] for type safety */}
                {(data.key_entities.organizations as string[]).map((o, i) => (
                  <span key={i} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">{o}</span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center text-sm uppercase tracking-wider">
                <i className="fas fa-map-marker-alt text-red-500 mr-2"></i> Places
              </h4>
              <div className="flex flex-wrap gap-2">
                {/* Fixed error: cast to string[] to resolve 'Property map does not exist on type unknown' */}
                {(data.key_entities.locations as string[]).map((l, i) => (
                  <span key={i} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Quiz Questions Section */}
      <div className="space-y-10">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
          <h3 className="text-2xl font-bold text-slate-800">Section-wise Quiz Breakdown</h3>
        </div>

        {Object.entries(groupedQuestions).map(([section, questions]) => (
          <div key={section} className="space-y-4">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">{section}</h4>
            <div className="grid grid-cols-1 gap-6">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      Section Question
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 mb-4 leading-tight">{q.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`p-4 rounded-2xl border-2 text-sm font-bold flex items-center ${
                        opt === q.answer ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-7 h-7 flex items-center justify-center rounded-lg mr-3 text-xs ${
                          opt === q.answer ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                        {opt === q.answer && <i className="fas fa-check-circle ml-auto"></i>}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Answer Insight</p>
                    <p className="text-sm text-blue-700/80 font-medium italic">"{q.explanation}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Further Reading */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <i className="fas fa-compass text-indigo-600 mr-3"></i>
          Explore Related Knowledge
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.related_topics.map((topic, i) => (
            <a 
              key={i} 
              href={`https://en.wikipedia.org/wiki/${topic.replace(/\s+/g, '_')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 border border-slate-100 px-4 py-4 rounded-2xl text-slate-700 font-bold text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-translate-y-1 transition-all flex items-center justify-between group"
            >
              {topic}
              <i className="fas fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay;
