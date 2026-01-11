
import React, { useState, useEffect } from 'react';
import { WikiData } from '../types';
import { getQuizHistory, getQuizById, deleteQuiz, QuizHistoryItem } from '../services/api';
import QuizModal from './QuizModal';
import { useToast } from './ToastContext';

interface HistoryProps {
  refreshTrigger?: number; // Used to refresh when new quiz is generated
}

const History: React.FC<HistoryProps> = ({ refreshTrigger }) => {
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<WikiData | null>(null);
  const [loadingQuizId, setLoadingQuizId] = useState<number | null>(null);
  const { showToast } = useToast();
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

  // Fetch history from the backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await getQuizHistory();
        setHistory(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching history:', err);
        setError(err.message || 'Failed to load history');
        showToast('Failed to load history: ' + (err.message || 'Unknown error'), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [refreshTrigger, showToast]); // Re-fetch when this changes

  const handleViewDetails = async (id: number) => {
    try {
      setLoadingQuizId(id);
      const quizData = await getQuizById(id);
      setSelectedQuiz(quizData);
    } catch (err: any) {
      console.error('Error fetching quiz details:', err);
      showToast('Failed to load quiz details: ' + err.message, 'error');
    } finally {
      setLoadingQuizId(null);
    }
  };

  const verifyDelete = (id: number) => {
    setQuizToDelete(id);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      await deleteQuiz(quizToDelete);
      setHistory(history.filter(item => item.id !== quizToDelete));
      showToast('Quiz deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting quiz:', err);
      showToast('Failed to delete quiz: ' + err.message, 'error');
    } finally {
      setQuizToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="inline-block p-6 bg-slate-50 rounded-full mb-4">
          <i className="fas fa-spinner fa-spin text-6xl text-blue-500"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Loading History...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="inline-block p-6 bg-red-50 rounded-full mb-4">
          <i className="fas fa-exclamation-circle text-6xl text-red-500"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Error Loading History</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95">
        <div className="inline-block p-6 bg-slate-50 rounded-full text-slate-300 mb-4">
          <i className="fas fa-history text-6xl"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-800">No History Yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          Start by generating a quiz on the "Generate Quiz" tab. Your past successes will appear here.
        </p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Learning History</h2>
            <p className="text-slate-500 text-sm">A list of articles you've analyzed and quizzed yourself on.</p>
          </div>
          <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest">
            {history.length} Saved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Article Metadata</th>
                <th className="px-8 py-5">Metrics</th>
                <th className="px-8 py-5">Activity Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                        {item.title.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{item.title}</span>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[240px]">{item.url}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-bold text-slate-700 flex items-center">
                        <i className="fas fa-question-circle text-blue-400 mr-2"></i>
                        Quiz Available
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        Click to View
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-600">
                        {formatDate(item.created_at)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-black">
                        {formatTime(item.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        disabled={loadingQuizId === item.id}
                        className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Full Details"
                      >
                        {loadingQuizId === item.id ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-expand-arrows-alt"></i>
                        )}
                      </button>
                      <button
                        onClick={() => verifyDelete(item.id)}
                        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-95"
                        title="Delete record"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuiz && (
        <QuizModal data={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
      )}

      {/* Delete Confirmation Modal */}
      {quizToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
                <i className="fas fa-trash-alt text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Quiz?</h3>
              <p className="text-slate-500">
                Are you sure you want to delete this quiz? This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setQuizToDelete(null)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
