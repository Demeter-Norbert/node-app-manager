import React, { useState } from 'react';
import { Bell, Copy, Check, ExternalLink } from "lucide-react";

interface NtfyBannerProps {
  ntfyTopic: string;
  isExpanded: boolean;
  onToggle: (val: boolean) => void;
}

const NtfyBanner: React.FC<NtfyBannerProps> = ({ ntfyTopic, isExpanded, onToggle }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ntfyTopic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isExpanded) return null;

  return (
    <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-5 mb-6 sm:mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all hover:border-indigo-500/50 shadow-lg">
      <div className="flex items-start sm:items-center gap-4">
        <button 
          onClick={() => onToggle(false)}
          className="p-3 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 hover:text-indigo-300 rounded-lg shrink-0 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/50"
          title="Fold"
        >
          <Bell size={24} />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-indigo-200">Real time crash alerts</h3>
          <p className="text-sm text-indigo-300/80 mt-1">
            Get real time crash alerts to your phone if a container unexpectably crashes! Subscribe to the topic using <a href="https://ntfy.sh" target="_blank" rel="noreferrer" className="underline hover:text-indigo-200">ntfy.sh</a>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full lg:w-auto">
        <div className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 flex items-center justify-between min-w-[240px] flex-1 lg:flex-initial shadow-inner">
          <span className="text-indigo-400 font-mono text-sm truncate mr-4">{ntfyTopic}</span>
          <button 
            onClick={handleCopy}
            className="text-gray-500 hover:text-indigo-300 transition-colors p-1"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
        <a 
          href={`https://ntfy.sh/${ntfyTopic}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg transition-colors border border-indigo-500/30 shrink-0"
          title="Open in new window"
        >
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
};

export default NtfyBanner;