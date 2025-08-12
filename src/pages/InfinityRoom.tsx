import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExploration } from '@/contexts/ExplorationContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Play, Pause, RotateCcw, TrendingUp, Lightbulb, Plus, Trash2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  id: number;
}

const InfinityRoom: React.FC = () => {
  const navigate = useNavigate();
  const { isInfinityRoomUnlocked } = useExploration();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showUnlockMessage, setShowUnlockMessage] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Game state
  const [points, setPoints] = useState<Point[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [loss, setLoss] = useState(0);
  const [weights, setWeights] = useState({ w: 0, b: 0 }); // Simple linear model: y = w*x + b
  const [learningRate, setLearningRate] = useState(0.01);
  const [showExplanation, setShowExplanation] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Check if user has unlocked the room
  useEffect(() => {
    if (!isInfinityRoomUnlocked) {
      setShowUnlockMessage(true);
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInfinityRoomUnlocked, navigate]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Initialize with some default points
  useEffect(() => {
    if (canvasSize.width === 0) return;
    
    setPoints([
      { id: 1, x: 100, y: 400 },
      { id: 2, x: 200, y: 350 },
      { id: 3, x: 300, y: 300 },
      { id: 4, x: 400, y: 250 },
      { id: 5, x: 500, y: 200 },
    ]);
    
    setWeights({ w: Math.random() * 2 - 1, b: Math.random() * 2 - 1 });
  }, [canvasSize.width]);

  // Training step
  const trainStep = useCallback(() => {
    if (!isTraining || points.length < 2) return;
    
    let totalLoss = 0;
    
    // Simple gradient descent for linear regression
    let gradW = 0;
    let gradB = 0;
    
    points.forEach(point => {
      const predicted = weights.w * (point.x / canvasSize.width) + weights.b;
      const error = predicted - (canvasSize.height - point.y) / canvasSize.height; // Normalize y (inverted canvas y)
      totalLoss += Math.pow(error, 2);
      gradW += error * (point.x / canvasSize.width);
      gradB += error;
    });
    
    const avgLoss = totalLoss / points.length;
    gradW = (gradW / points.length) * learningRate;
    gradB = (gradB / points.length) * learningRate;
    
    setWeights(prev => ({
      w: prev.w - gradW,
      b: prev.b - gradB
    }));
    
    setLoss(avgLoss);
    
    setTrainingLogs(prev => [...prev.slice(-4), `Practice round ${currentEpoch + 1}: Mistake level ${avgLoss.toFixed(2)}`]);
    
    setCurrentEpoch(prev => prev + 1);
  }, [isTraining, points, weights, learningRate, canvasSize, currentEpoch]);

  // Training loop
  useEffect(() => {
    if (!isTraining) return;
    
    const interval = setInterval(trainStep, 50);
    return () => clearInterval(interval);
  }, [isTraining, trainStep]);

  // Render graph
  const renderGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw predicted line
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const startY = canvas.height - (weights.b * canvas.height);
    const endY = canvas.height - ((weights.w + weights.b) * canvas.height);
    ctx.moveTo(0, startY);
    ctx.lineTo(canvas.width, endY);
    ctx.stroke();
    
    // Draw points
    points.forEach(point => {
      ctx.fillStyle = selectedPoint === point.id ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points, weights, canvasSize, selectedPoint]);

  // Render loop
  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  // Handle canvas click to add points
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on existing point
    const clickedPoint = points.find(point => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      return distance <= 8;
    });
    
    if (clickedPoint) {
      setSelectedPoint(clickedPoint.id);
    } else {
      // Add new point
      setPoints(prev => [...prev, { id: Date.now(), x, y }]);
    }
  }, [points]);

  // Delete selected point
  const deleteSelectedPoint = () => {
    if (selectedPoint !== null) {
      setPoints(prev => prev.filter(p => p.id !== selectedPoint));
      setSelectedPoint(null);
    }
  };

  // Reset game
  const resetGame = () => {
    setPoints([]);
    setWeights({ w: Math.random() * 2 - 1, b: Math.random() * 2 - 1 });
    setCurrentEpoch(0);
    setLoss(0);
    setIsTraining(false);
    setTrainingLogs([]);
    setSelectedPoint(null);
  };

  // Toggle training
  const toggleTraining = () => {
    setIsTraining(!isTraining);
  };

  // Unlock message
  if (showUnlockMessage) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-yellow-400 font-mono">
          <h1 className="text-4xl mb-4">🔒 Access Denied</h1>
          <p className="text-xl mb-4">You need to explore 100% of the site first!</p>
          <p className="text-lg">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="bg-black/50 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </Button>
        <Button
          onClick={toggleTraining}
          variant="outline"
          size="sm"
          className={`${
            isTraining 
              ? 'bg-red-600 text-white border-red-400' 
              : 'bg-green-600 text-white border-green-400'
          } hover:opacity-80`}
        >
          {isTraining ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isTraining ? 'Stop Learning' : 'Start Learning'}
        </Button>
        <Button
          onClick={resetGame}
          variant="outline"
          size="sm"
          className="bg-black/50 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={() => setShowExplanation(!showExplanation)}
          variant="outline"
          size="sm"
          className="bg-black/50 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          How It Works
        </Button>
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 text-center">
        <div className="bg-black/50 border border-yellow-400/50 rounded-lg p-3 text-yellow-400 font-mono">
          <h2 className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
            <Brain className="w-5 h-5" />
            AI Line Fitting Game
          </h2>
          <p className="text-sm">Add points and watch the AI learn to fit a line!</p>
        </div>
      </div>

      {/* How It Works Panel */}
      {showExplanation && (
        <div className="absolute top-16 left-4 z-20 bg-black/80 border border-yellow-400/50 rounded-lg p-4 text-yellow-400 font-mono text-sm space-y-3 max-w-[300px]">
          <h3 className="font-bold text-base">How It Works</h3>
          <div className="space-y-2 text-xs">
            <p>• Click to add points on the canvas</p>
            <p>• The AI learns to draw a line that fits your points</p>
            <p>• Watch the green line get closer to your points</p>
            <p>• The "Mistake level" goes down as it improves</p>
            <p>• Click a point to select it, then delete</p>
            <p>• Reset to start over</p>
          </div>
        </div>
      )}

      {/* Controls Panel */}
      <div className="absolute top-16 right-4 z-20 bg-black/80 border border-yellow-400/50 rounded-lg p-4 text-yellow-400 font-mono text-sm space-y-3 min-w-[250px]">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Controls
        </h3>
        
        <div className="space-y-2">
          <Button
            onClick={() => setPoints(prev => [...prev, { id: Date.now(), x: Math.random() * canvasSize.width, y: Math.random() * canvasSize.height }])}
            className="w-full bg-yellow-600 text-black hover:bg-yellow-700 text-xs"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Random Point
          </Button>
          
          <Button
            onClick={deleteSelectedPoint}
            disabled={selectedPoint === null}
            className="w-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-xs"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected Point
          </Button>
          
          <div className="text-xs text-center pt-2 border-t border-yellow-400/30">
            Points: {points.length}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="cursor-crosshair"
        onClick={handleCanvasClick}
      />

      {/* Training Stats */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/80 border border-yellow-400/50 rounded-lg p-4 text-yellow-400 font-mono text-sm space-y-2 min-w-[250px]">
        <h3 className="font-bold text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Learning Progress
        </h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Practice rounds:</span>
            <span>{currentEpoch}</span>
          </div>
          <div className="flex justify-between">
            <span>Mistake level:</span>
            <span>{loss.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Line equation:</span>
            <span>y = {weights.w.toFixed(2)}x + {weights.b.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={isTraining ? 'text-green-400' : 'text-gray-400'}>
              {isTraining ? 'Learning!' : 'Ready'}
            </span>
          </div>
          <div className="space-y-1 pt-2 border-t border-yellow-400/30 max-h-32 overflow-y-auto">
            {trainingLogs.map((log, i) => (
              <p key={i} className="text-xs opacity-80">{log}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/80 border border-yellow-400/50 rounded-lg p-4 text-yellow-400 font-mono text-sm max-w-[300px]">
        <h3 className="font-bold mb-2">What's Happening</h3>
        <div className="space-y-1 text-xs">
          <div>• Click to add points</div>
          <div>• Start learning to see the AI fit a line</div>
          <div>• Watch the green line get closer</div>
          <div>• The AI gets better with each practice</div>
          <div>• See the line equation improve</div>
          <div>• This is how AI learns patterns!</div>
        </div>
      </div>
    </div>
  );
};

export default InfinityRoom;
