
import React, { useEffect, useState } from 'react';
import { previewURL } from '../services/api';

// Quick check for valid Wikipedia URLs
const isValidWikiUrl = (url: string): boolean => {
  return /^https?:\/\/(en\.)?wikipedia\.org\/wiki\/[^:]+$/.test(url);
};

interface URLPreviewProps {
  url: string;
  onValidated: (title: string) => void;
}

const URLPreview: React.FC<URLPreviewProps> = ({ url, onValidated }) => {
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (isValidWikiUrl(url)) {
      const fetchTitle = async () => {
        setLoading(true);
        try {
          // Use our backend API to just get the title
          const data = await previewURL(url);
          if (active) {
            setTitle(data.title);
            onValidated(data.title);
          }
        } catch (e) {
          if (active) setTitle(null);
        } finally {
          if (active) setLoading(false);
        }
      };

      const timeout = setTimeout(fetchTitle, 500);
      return () => {
        active = false;
        clearTimeout(timeout);
      };
    } else {
      setTitle(null);
    }
  }, [url, onValidated]);

  if (loading) {
    return (
      <div className="mt-2 text-xs text-blue-500 flex items-center animate-pulse">
        <i className="fas fa-circle-notch fa-spin mr-2"></i>
        Fetching article metadata...
      </div>
    );
  }

  if (title) {
    return (
      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center animate-in fade-in slide-in-from-top-1">
        <i className="fas fa-file-alt text-blue-500 mr-3"></i>
        <div className="flex-grow">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Article Detected</p>
          <p className="text-sm font-semibold text-blue-900">{title}</p>
        </div>
        <i className="fas fa-check-circle text-green-500"></i>
      </div>
    );
  }

  return null;
};

export default URLPreview;
