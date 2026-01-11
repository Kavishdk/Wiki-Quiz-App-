
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500'
    }

    return (
        <div className={`flex items-center p-4 mb-4 rounded-xl border shadow-lg max-w-md animate-in slide-in-from-top-5 fade-in duration-300 ${styles[type]}`}>
            <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconColors[type]}`}>
                <i className={`fas ${icons[type]} text-xl`}></i>
            </div>
            <div className="ml-3 text-sm font-medium pr-4 break-words">
                {message}
            </div>
            <button
                type="button"
                className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-opacity-20 hover:bg-black transition-colors ${iconColors[type]}`}
                onClick={onClose}
            >
                <span className="sr-only">Close</span>
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export default Toast;
