import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, ExternalLink, Calendar, Clock } from "lucide-react";
import { Essay } from "./EssayCard";

interface EssayReaderProps {
  essay: Essay;
  onBack: () => void;
}

export function EssayReader({ essay, onBack }: EssayReaderProps) {
  const handleDownload = () => {
    window.open(essay.downloadLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 font-mono">
      {/* Navigation Bar */}
      <div className="bg-yellow-900 border-b-2 border-yellow-400 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">MAHIR BANSAL</h1>
          <div className="text-right">
            <div className="text-sm">Essays & Thoughts</div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-yellow-600 text-black font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded"
          >
            ← Back to Essays
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors border border-blue-400 rounded"
          >
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Essay Header */}
        <div className="space-y-6 mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-yellow-300 leading-tight">
            {essay.title}
          </h1>
          
          <p className="text-xl text-white leading-relaxed">
            {essay.description}
          </p>
        </div>

        {/* Essay Content */}
        <article className="max-w-none">
          {/* Excerpt */}
          <blockquote className="border-l-4 border-yellow-400 pl-6 py-4 mb-8 bg-yellow-900/30 rounded-r-lg">
            <p className="text-yellow-200 italic text-lg leading-relaxed mb-0">
              "{essay.excerpt}"
            </p>
          </blockquote>
          
          {essay.content ? (
            <div 
              className="leading-relaxed text-white space-y-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mt-12 [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-white [&>ul]:mb-4 [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:text-white [&>ol]:mb-4 [&>ol]:pl-6 [&>ol>li]:mb-2 [&>ol>li]:text-white [&>blockquote]:border-l-4 [&>blockquote]:border-yellow-400 [&>blockquote]:pl-4 [&>blockquote]:py-2 [&>blockquote]:bg-yellow-900/30 [&>blockquote]:rounded-r [&>blockquote]:italic [&>blockquote]:text-yellow-200 [&>strong]:text-white [&>em]:text-white"
              dangerouslySetInnerHTML={{ __html: essay.content }}
            />
          ) : (
            <div className="text-center py-12 space-y-4">
              <p className="text-white text-lg">
                This essay is available as a PDF download.
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors border border-blue-400 rounded"
              >
                📄 Download Full Essay
              </button>
            </div>
          )}
        </article>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-yellow-400 p-4 text-center text-yellow-300">
        <p className="font-bold">THANK YOU</p>
        <p className="text-sm mt-1">Technology • Government • Markets</p>
      </div>
    </div>
  );
}