import { useState, useEffect } from "react";
import { EssayCard, Essay } from "@/components/EssayCard";
import { EssayReader } from "@/components/EssayReader";
import { essays } from "@/data/essays";
import { Button } from "@/components/ui/button";
import { PenTool, ArrowLeft } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useExploration } from "@/contexts/ExplorationContext";

const Thoughts = () => {
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isInfinityRoomUnlocked } = useExploration();

  // Handle URL parameters for direct essay access
  useEffect(() => {
    const essaySlug = searchParams.get('essay');
    if (essaySlug) {
      const essay = essays.find(e => e.id === essaySlug);
      if (essay) {
        setSelectedEssay(essay);
      }
    }
  }, [searchParams]);

  const handleReadEssay = (essay: Essay) => {
    setSelectedEssay(essay);
    // Update URL with essay parameter
    navigate(`/thoughts?essay=${essay.id}`);
  };

  const handleBackToList = () => {
    setSelectedEssay(null);
    // Clear URL parameter
    navigate('/thoughts');
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
          <Link
            to="/"
            className="px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors border border-yellow-400 rounded"
          >
            🏠 Home
          </Link>
          <div className="px-4 py-2 bg-yellow-600 text-white font-bold border border-yellow-400 rounded opacity-50">
            📝 Writings
          </div>
          <Link
            to="/frontier"
            className="px-4 py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors border border-orange-400 rounded"
          >
            🤖 AI Frontier
          </Link>
          <a
            href="https://www.krypte.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors border border-purple-400 rounded"
          >
            🛡️ Krypte
          </a>
          <a
            href="https://www.linkedin.com/in/mahirbansal/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors border border-blue-400 rounded"
          >
            💼 LinkedIn
          </a>
          <a
            href="mailto:mb@mahirbansal.com"
            className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border border-red-400 rounded"
          >
            📧 Email
          </a>
          <a
            href="https://drive.google.com/file/d/1roTioVMkGKi3oM-4IJn8BsYVifJdzhPV/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors border border-orange-400 rounded"
          >
            📄 Resume
          </a>
          <a
            href="https://github.com/mbansal2006"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors border border-gray-400 rounded"
          >
            💻 GitHub
          </a>
          {isInfinityRoomUnlocked && (
            <Link
              to="/infinity"
              className="px-4 py-2 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors border border-purple-400 rounded"
            >
              ∞ Infinity Room
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-medium bg-yellow-900 px-4 py-2 rounded-full border border-yellow-400">
            <PenTool className="w-4 h-4" />
            Essays & Thoughts
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-yellow-300 leading-tight">
            Writing
          </h1>
          <p className="text-xl text-yellow-200 max-w-3xl mx-auto leading-relaxed">
            Exploring the intersection of technology, government, and markets through essays on AI, policy, and the future we're building.
          </p>
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
      </div>

      {/* Footer */}
      <div className="border-t-2 border-yellow-400 p-4 text-center text-yellow-300">
        <p className="font-bold">THANK YOU</p>
        <p className="text-sm mt-1">Technology • Government • Markets</p>
      </div>
    </div>
  );
};

export default Thoughts;