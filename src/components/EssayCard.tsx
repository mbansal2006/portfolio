import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Download, BookOpen, Calendar, Clock } from "lucide-react";

export interface Essay {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  downloadLink: string;
  content?: string;
}

interface EssayCardProps {
  essay: Essay;
  onRead: (essay: Essay) => void;
}

export function EssayCard({ essay, onRead }: EssayCardProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(essay.downloadLink, '_blank');
  };

  return (
    <div 
      className="group relative overflow-hidden bg-yellow-900 border border-yellow-400 hover:border-yellow-300 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20 cursor-pointer rounded-lg"
      onClick={() => onRead(essay)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-semibold text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">
              {essay.title}
            </h3>
            <p className="text-yellow-200 text-sm leading-relaxed">
              {essay.description}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4">
            <BookOpen className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

        {/* Excerpt */}
        <div className="border-l-2 border-yellow-600 pl-4 group-hover:border-yellow-400 transition-colors duration-300">
          <p className="text-yellow-200 italic text-sm leading-relaxed">
            "{essay.excerpt}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            className="flex-1 px-4 py-2 bg-yellow-600 text-black font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRead(essay);
            }}
          >
            📖 Read Essay
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors border border-blue-400 rounded text-sm"
            onClick={handleDownload}
          >
            📄
          </button>
        </div>
      </div>
    </div>
  );
}