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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-essay-card-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="hover:bg-essay-card-hover"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Essays
            </Button>
            <Button 
              variant="essay" 
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-gradient-card border-essay-card-border">
          <div className="p-8 lg:p-12">
            {/* Essay Header */}
            <div className="space-y-6 mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {essay.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {essay.description}
              </p>

            </div>

            {/* Essay Content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div className="bg-essay-card border border-essay-card-border rounded-lg p-6 mb-8">
                <p className="text-muted-foreground italic text-lg leading-relaxed mb-0">
                  "{essay.excerpt}"
                </p>
              </div>
              
              {essay.content ? (
                <div 
                  className="leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: essay.content }}
                />
              ) : (
                <div className="text-center py-12 space-y-4">
                  <p className="text-muted-foreground text-lg">
                    This essay is available as a PDF download.
                  </p>
                  <Button 
                    variant="essay" 
                    onClick={handleDownload}
                    className="mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download Full Essay
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}