import { useState } from "react";
import { EssayCard, Essay } from "@/components/EssayCard";
import { EssayReader } from "@/components/EssayReader";
import { essays } from "@/data/essays";
import { Button } from "@/components/ui/button";
import { PenTool, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Thoughts = () => {
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

  const handleReadEssay = (essay: Essay) => {
    setSelectedEssay(essay);
  };

  const handleBackToList = () => {
    setSelectedEssay(null);
  };

  if (selectedEssay) {
    return (
      <EssayReader 
        essay={selectedEssay} 
        onBack={handleBackToList} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-essay-card-border bg-gradient-card">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <PenTool className="w-4 h-4" />
              Essays & Thoughts
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              Writing
            </h1>
            <div className="flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Essays Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {essays.map((essay) => (
            <EssayCard
              key={essay.id}
              essay={essay}
              onRead={handleReadEssay}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-gradient-card border border-essay-card-border rounded-2xl">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            More Essays Coming Soon
          </h3>
          <p className="text-muted-foreground mb-6">
            New thoughts and explorations are always in development. Check back regularly for fresh perspectives.
          </p>
          <Button variant="essay-outline">
            Subscribe for Updates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Thoughts;