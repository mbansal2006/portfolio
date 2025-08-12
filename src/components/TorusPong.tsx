import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRAF } from '@/lib/useRAF';
import { 
  Ball, 
  Cursor, 
  PhysicsConfig, 
  Vector2D,
  updateBall, 
  getBallSpeed, 
  calculateDistanceTraveled,
  detectEdgeCross
} from '@/lib/torusPhysics';

interface GameStats {
  speed: number;
  longestLoop: number;
  timeAlive: number;
  bounces: number;
  totalDistance: number;
}

interface PowerUp {
  id: number;
  pos: Vector2D;
  type: 'speed' | 'split' | 'freeze' | 'heavy';
  timeLeft: number;
}

interface TorusPongProps {
  width: number;
  height: number;
}

export const TorusPong: React.FC<TorusPongProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([
    {
      id: 0,
      pos: { x: width / 2, y: height / 2 },
      vel: { x: 100, y: 50 },
      radius: 8
    }
  ]);
  
  const [cursor, setCursor] = useState<Cursor>({
    pos: { x: width / 2, y: height / 2 },
    radius: 24
  });
  
  const [physicsConfig, setPhysicsConfig] = useState<PhysicsConfig>({
    damping: 0.999,
    impulseCoefficient: 200,
    tangentialDamping: 0.1,
    attractorMode: false
  });
  
  const [gameStats, setGameStats] = useState<GameStats>({
    speed: 0,
    longestLoop: 0,
    timeAlive: 0,
    bounces: 0,
    totalDistance: 0
  });
  
  // Load best loop streak from localStorage
  const [bestLoopStreak, setBestLoopStreak] = useState(0);
  
  // Game settings
  const [showTrails, setShowTrails] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [ballSpeedScale, setBallSpeedScale] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Loop detection state
  const [edgeCrossHistory, setEdgeCrossHistory] = useState<Array<{edge: string, pos: Vector2D, time: number}>>([]);
  const [currentLoopCount, setCurrentLoopCount] = useState(0);
  const [lastBounceTime, setLastBounceTime] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activeEffects, setActiveEffects] = useState<{
    speed: boolean;
    freeze: boolean;
    heavy: boolean;
  }>({
    speed: false,
    freeze: false,
    heavy: false
  });
  
  // Audio context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Load best loop streak on mount
  useEffect(() => {
    const saved = localStorage.getItem('torus-pong-best-loop');
    if (saved) {
      try {
        setBestLoopStreak(parseInt(saved));
      } catch (error) {
        console.error('Failed to load best loop streak:', error);
      }
    }
  }, []);
  
  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current && soundEnabled) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [soundEnabled]);
  
  // Play bounce sound
  const playBounceSound = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(volume * 0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  }, [soundEnabled, volume]);
  
  // Handle mouse/touch movement
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCursor(prev => ({
      ...prev,
      pos: { x, y }
    }));
  }, []);
  
  // Handle keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const moveSpeed = 200;
    const deltaTime = 1/60; // Assume 60fps for keyboard input
    
    setCursor(prev => {
      let newX = prev.pos.x;
      let newY = prev.pos.y;
      
      switch (e.key) {
        case 'ArrowLeft':
          newX -= moveSpeed * deltaTime;
          break;
        case 'ArrowRight':
          newX += moveSpeed * deltaTime;
          break;
        case 'ArrowUp':
          newY -= moveSpeed * deltaTime;
          break;
        case 'ArrowDown':
          newY += moveSpeed * deltaTime;
          break;
      }
      
      return {
        ...prev,
        pos: { x: newX, y: newY }
      };
    });
    
    switch (e.key) {
      case ' ':
        e.preventDefault();
        setPhysicsConfig(prev => ({ ...prev, attractorMode: !prev.attractorMode }));
        break;
      case 'Enter':
        e.preventDefault();
        if (balls.length < 5) {
          addBall();
        }
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        resetGame();
        break;
    }
  }, [balls.length]);
  
  // Add a new ball
  const addBall = useCallback(() => {
    if (balls.length >= 5) return;
    
    const newBall: Ball = {
      id: Date.now(),
      pos: { x: Math.random() * width, y: Math.random() * height },
      vel: { 
        x: (Math.random() - 0.5) * 200 * ballSpeedScale, 
        y: (Math.random() - 0.5) * 200 * ballSpeedScale 
      },
      radius: 8
    };
    
    setBalls(prev => [...prev, newBall]);
  }, [balls.length, width, height, ballSpeedScale]);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setBalls([{
      id: 0,
      pos: { x: width / 2, y: height / 2 },
      vel: { x: 100 * ballSpeedScale, y: 50 * ballSpeedScale },
      radius: 8
    }]);
    setGameStats({
      speed: 0,
      longestLoop: 0,
      timeAlive: 0,
      bounces: 0,
      totalDistance: 0
    });
    setEdgeCrossHistory([]);
    setCurrentLoopCount(0);
  }, [width, height, ballSpeedScale]);
  
  // Challenge mode preset
  const enableChallengeMode = useCallback(() => {
    setBalls([
      {
        id: 0,
        pos: { x: width / 2, y: height / 2 },
        vel: { x: 150, y: 75 },
        radius: 8
      },
      {
        id: 1,
        pos: { x: width / 3, y: height / 3 },
        vel: { x: -120, y: 90 },
        radius: 8
      }
    ]);
    setBallSpeedScale(1.5);
    setCursor(prev => ({ ...prev, radius: 16 }));
    setGameStats({
      speed: 0,
      longestLoop: 0,
      timeAlive: 0,
      bounces: 0,
      totalDistance: 0
    });
    setEdgeCrossHistory([]);
    setCurrentLoopCount(0);
  }, [width, height]);
  
  // Update game physics and stats
  const updateGame = useCallback((deltaTime: number) => {
    setBalls(prevBalls => {
      const newBalls = prevBalls.map(ball => {
        const oldPos = { ...ball.pos };
        const newBall = { ...ball };
        
        // Apply speed scale to velocity
        newBall.vel.x *= ballSpeedScale;
        newBall.vel.y *= ballSpeedScale;
        
        // Update physics
        updateBall(newBall, cursor, width, height, physicsConfig, deltaTime);
        
        // Remove speed scale for rendering
        newBall.vel.x /= ballSpeedScale;
        newBall.vel.y /= ballSpeedScale;
        
        // Check for edge crossing (loop detection)
        const edgeCross = detectEdgeCross(oldPos, newBall.pos, width, height);
        if (edgeCross !== 'none') {
          setEdgeCrossHistory(prev => [
            ...prev.slice(-9), // Keep last 10 crossings
            { edge: edgeCross, pos: { ...newBall.pos }, time: Date.now() }
          ]);
        }
        
        return newBall;
      });
      
      return newBalls;
    });
    
    // Update stats
    setGameStats(prev => {
      const mainBall = balls[0];
      if (!mainBall) return prev;
      
      const speed = getBallSpeed(mainBall);
      const distance = calculateDistanceTraveled(mainBall, deltaTime);
      
      return {
        ...prev,
        speed: Math.round(speed),
        timeAlive: prev.timeAlive + deltaTime,
        totalDistance: prev.totalDistance + distance
      };
    });
  }, [balls, cursor, width, height, physicsConfig, ballSpeedScale]);
  
  // Check for bounces and update loop detection
  useEffect(() => {
    const mainBall = balls[0];
    if (!mainBall) return;
    
    const distance = Math.sqrt(
      Math.pow(mainBall.pos.x - cursor.pos.x, 2) + 
      Math.pow(mainBall.pos.y - cursor.pos.y, 2)
    );
    
    if (distance <= mainBall.radius + cursor.radius) {
      const now = Date.now();
      if (now - lastBounceTime > 100) { // Debounce bounces
        setGameStats(prev => ({ ...prev, bounces: prev.bounces + 1 }));
        setLastBounceTime(now);
        playBounceSound();
      }
    }
  }, [balls, cursor, lastBounceTime, playBounceSound]);
  
  // Loop detection logic
  useEffect(() => {
    if (edgeCrossHistory.length < 4) return;
    
    const recent = edgeCrossHistory.slice(-4);
    const edges = recent.map(cross => cross.edge);
    
    // Simple loop detection: check for a pattern that returns to starting area
    if (edges.length >= 4) {
      const firstPos = recent[0].pos;
      const lastPos = recent[recent.length - 1].pos;
      const distance = Math.sqrt(
        Math.pow(firstPos.x - lastPos.x, 2) + 
        Math.pow(firstPos.y - lastPos.y, 2)
      );
      
      if (distance < 50) { // Within 50px of starting position
        setCurrentLoopCount(prev => {
          const newCount = prev + 1;
          setGameStats(prevStats => ({
            ...prevStats,
            longestLoop: Math.max(prevStats.longestLoop, newCount)
          }));
          
          // Save to localStorage if it's a new best
          if (newCount > bestLoopStreak) {
            setBestLoopStreak(newCount);
            localStorage.setItem('torus-pong-best-loop', newCount.toString());
          }
          
          return newCount;
        });
        setEdgeCrossHistory([]); // Reset for next loop
      }
    }
  }, [edgeCrossHistory]);
  
  // Render the game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    if (showTrails) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);
    }
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    
    // Draw balls
    balls.forEach(ball => {
      // Ball glow
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    });
    
    // Draw cursor
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(cursor.pos.x, cursor.pos.y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw cursor radius ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cursor.pos.x, cursor.pos.y, cursor.radius, 0, Math.PI * 2);
    ctx.stroke();
  }, [balls, cursor, width, height, showTrails, showGrid]);
  
  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Animation loop
  useRAF({
    onFrame: (deltaTime) => {
      updateGame(deltaTime);
      render();
    }
  });
  
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="cursor-none"
        onPointerMove={handlePointerMove}
        onPointerEnter={initAudio}
        style={{ touchAction: 'none' }}
      />
      
      {/* Controls UI */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-yellow-400/50 rounded-lg p-4 text-yellow-400 font-mono text-sm space-y-3 min-w-[200px]">
        <div className="flex items-center justify-between">
          <span>Trails</span>
          <input
            type="checkbox"
            checked={showTrails && !prefersReducedMotion}
            onChange={(e) => setShowTrails(e.target.checked)}
            disabled={prefersReducedMotion}
            className="w-4 h-4"
          />
        </div>
        {prefersReducedMotion && (
          <div className="text-xs text-gray-400">Trails disabled (reduced motion)</div>
        )}
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Cursor Radius</span>
            <span>{cursor.radius}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="48"
            value={cursor.radius}
            onChange={(e) => setCursor(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Ball Speed</span>
            <span>{ballSpeedScale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={ballSpeedScale}
            onChange={(e) => setBallSpeedScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span>Attractor</span>
          <input
            type="checkbox"
            checked={physicsConfig.attractorMode}
            onChange={(e) => setPhysicsConfig(prev => ({ ...prev, attractorMode: e.target.checked }))}
            className="w-4 h-4"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={addBall}
            disabled={balls.length >= 5}
            className="px-3 py-1 bg-yellow-600 text-black font-bold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs"
          >
            Add Ball
          </button>
          <button
            onClick={resetGame}
            className="px-3 py-1 bg-red-600 text-white font-bold hover:bg-red-700 rounded text-xs"
          >
            Reset
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={enableChallengeMode}
            className="px-3 py-1 bg-purple-600 text-white font-bold hover:bg-purple-700 rounded text-xs"
          >
            Challenge Mode
          </button>
        </div>
        
        {soundEnabled && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span>Sound</span>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span>Grid</span>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="w-4 h-4"
          />
        </div>
      </div>
      
      {/* Stats HUD */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-yellow-400/50 rounded-lg p-4 text-yellow-400 font-mono text-sm space-y-2 min-w-[200px]">
        <div className="flex justify-between">
          <span>Speed:</span>
          <span>{gameStats.speed} px/s</span>
        </div>
        <div className="flex justify-between">
          <span>Longest Loop:</span>
          <span>{gameStats.longestLoop}</span>
        </div>
        <div className="flex justify-between">
          <span>Best Ever:</span>
          <span>{bestLoopStreak}</span>
        </div>
        <div className="flex justify-between">
          <span>Time Alive:</span>
          <span>{Math.round(gameStats.timeAlive)}s</span>
        </div>
        <div className="flex justify-between">
          <span>Bounces:</span>
          <span>{gameStats.bounces}</span>
        </div>
        <div className="flex justify-between">
          <span>Distance:</span>
          <span>{Math.round(gameStats.totalDistance)}px</span>
        </div>
        <div className="flex justify-between">
          <span>Current Loop:</span>
          <span>{currentLoopCount}</span>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-yellow-400/50 rounded-lg p-4 text-yellow-400 font-mono text-sm max-w-[300px]">
        <h3 className="font-bold mb-2">Controls</h3>
        <div className="space-y-1 text-xs">
          <div>Mouse: Move cursor</div>
          <div>Arrows: Move cursor (keyboard)</div>
          <div>Space: Toggle attractor</div>
          <div>Enter: Add ball</div>
          <div>R: Reset game</div>
        </div>
      </div>
    </div>
  );
};
