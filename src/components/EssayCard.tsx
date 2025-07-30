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
    <Card 
      className="group relative overflow-hidden bg-gradient-card border-essay-card-border hover:border-primary/30 transition-all duration-500 ease-smooth hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
      onClick={() => onRead(essay)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {essay.title}
            </h3>
            <p className="text-essay-meta text-sm leading-relaxed">
              {essay.description}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Excerpt */}
        <div className="border-l-2 border-essay-card-border pl-4 group-hover:border-primary/50 transition-colors duration-300">
          <p className="text-muted-foreground italic text-sm leading-relaxed">
            "{essay.excerpt}"
          </p>
        </div>


        {/* Actions */}
        <div className="flex gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-bounce">
          <Button 
            variant="essay" 
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onRead(essay);
            }}
          >
            <BookOpen className="w-4 h-4" />
            Read Essay
          </Button>
          <Button 
            variant="essay-outline" 
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}