
import React, { useEffect } from 'react';
import { WikiData } from '../types';
import QuizDisplay from './QuizDisplay';

interface QuizModalProps {
  data: WikiData;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ data, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      <div className="relative bg-slate-50 w-full max-w-5xl h-full max-h-[90vh] rounded-[2rem] shadow-2xl overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg text-sm">
              <i className="fas fa-history"></i>
            </div>
            <h2 className="font-bold text-slate-800">Historical Record</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="p-8">
          <QuizDisplay data={data} />
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
