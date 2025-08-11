import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

interface Position {
  x: number;
  y: number;
}

interface Experience {
  id: string;
  name: string;
  type: 'school' | 'job' | 'location' | 'achievement' | 'project';
  location: string;
  description: string;
  year?: string;
  color: string;
  points: number;
  impressiveness: number; // 0-10 scale
  details?: string[];
  url?: string;
  x?: number;
  y?: number;
}

const Index = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Experience[]>([]);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [gameSpeed, setGameSpeed] = useState(100);
  const [collectedExperiences, setCollectedExperiences] = useState<Experience[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  const GRID_SIZE = 20;
  const CELL_SIZE = 25;

  // Mahir's life experiences as food items
  const experiences: Experience[] = [
    // Schools
    { id: "shimotsu", name: "Shimotsu Elementary School", type: "school", location: "McAllen, TX", description: "Elementary School", color: "#FF6B6B", points: 5, impressiveness: 2, year: "2012-2015" },
    { id: "luther-jones", name: "Luther Jones Elementary School", type: "school", location: "Corpus Christi, TX", description: "Elementary School", color: "#FF6B6B", points: 5, impressiveness: 2, year: "2015-2016" },
    { id: "windsor-park", name: "Windsor Park Elementary", type: "school", location: "Corpus Christi, TX", description: "Elementary school", color: "#FF6B6B", points: 5, impressiveness: 2, year: "2016-2017" },
    { id: "marvin-baker", name: "Marvin Baker Middle School", type: "school", location: "Corpus Christi, TX", description: "Middle School", color: "#FF6B6B", points: 8, impressiveness: 3, year: "2018-2020" },
    { id: "stanford-ohs", name: "Stanford University OHS", type: "school", location: "Redwood City, CA", description: "High School", color: "#FF6B6B", points: 10, impressiveness: 8, year: "2020-2002" },
    { id: "lightridge", name: "Lightridge High School", type: "school", location: "Aldie, VA", description: "High School", color: "#FF6B6B", points: 8, impressiveness: 4, year: "2022" },
    { id: "page-school", name: "US Senate Page School", type: "school", location: "Washington, DC", description: "High School", color: "#FF6B6B", points: 8, impressiveness: 9, year: "2023" },
    { id: "indian-springs", name: "Indian Springs School", type: "school", location: "Birmingham, AL", description: "High School", color: "#FF6B6B", points: 8, impressiveness: 6, year: "2023-2024" },
    { id: "washu", name: "Washington University", type: "school", location: "St. Louis, MO", description: "BA, Math & Computer Science", color: "#FF6B6B", points: 15, impressiveness: 7, year: "2025-TBD"},

    // Jobs & Internships
    { id: "bef", name: "Business Economics & Finance Club", type: "job", location: "Stanford University OHS", description: "Co-President", color: "#4ECDC4", points: 12, impressiveness: 6, year: "2020-2022" },
    { id: "debate", name: "Debate Club", type: "job", location: "Multiple Schools", description: "Debater", color: "#4ECDC4", points: 12, impressiveness: 5, year: "2016-2022" },
    { id: "northern-va-wealth", name: "Northern Virginia Wealth Management", type: "job", location: "Aldie, VA", description: "Research Assistant", color: "#4ECDC4", points: 12, impressiveness: 5, year: "2022" },
    { id: "senate-page", name: "US Senate Page School", type: "job", location: "Washington, DC", description: "US Senate Page", color: "#4ECDC4", points: 15, impressiveness: 9, year: "2023" },
    { id: "treasury", name: "US Department of Treasury", type: "job", location: "Washington, DC", description: "OCIO Intern", color: "#4ECDC4", points: 20, impressiveness: 8, year: "2022" },
    { id: "senate-intern", name: "Office of Senator Tim Kaine", type: "job", location: "Washington, DC", description: "Legislative Intern", color: "#4ECDC4", points: 18, impressiveness: 8, year: "2024" },
    { id: "todd-strategy", name: "Todd Strategy Group", type: "job", location: "Washington, DC", description: "Government Affairs Intern", color: "#4ECDC4", points: 16, impressiveness: 7, year: "2025" },
    { id: "tiber-creek", name: "Tiber Creek Group", type: "job", location: "Washington, DC", description: "Government Affairs Intern", color: "#4ECDC4", points: 18, impressiveness: 7, year: "2025" },
    { id: "launch-ai", name: "Founder", type: "job", location: "LAUNCH Founder University", description: "Founder", color: "#96CEB4", points: 18, impressiveness: 8 },

    // Locations
    { id: "bathinda", name: "Bathinda, PB", type: "location", location: "India", description: "City in Punjab, India", color: "#45B7D1", points: 6, impressiveness: 3, year: "2015" },
    { id: "mcallen", name: "McAllen, TX", type: "location", location: "United States", description: "City in Texas", color: "#45B7D1", points: 6, impressiveness: 2, year: "2006-2015" },
    { id: "corpus", name: "Corpus Christi, TX", type: "location", location: "United States", description: "City in Texas", color: "#45B7D1", points: 6, impressiveness: 2, year: "2016-2021" },
    { id: "birmingham", name: "Birmingham, AL", type: "location", location: "United States", description: "City in Alabama", color: "#45B7D1", points: 6, impressiveness: 3, year: "2023-2024" },
    { id: "st-louis", name: "St. Louis, MO", type: "location", location: "United States", description: "City in Missouri", color: "#45B7D1", points: 6, impressiveness: 4, year: "2024-TBD" },
    { id: "aldie", name: "Aldie, VA", type: "location", location: "United States", description: "Town in Virginia", color: "#45B7D1", points: 6, impressiveness: 3, year: "2021-2023" },
    { id: "washington", name: "Washington, DC", type: "location", location: "United States", description: "Capital of the United States", color: "#45B7D1", points: 6, impressiveness: 5, year: "2023-2025" },
    { id: "virginia", name: "Virginia", type: "location", location: "United States", description: "State in the United States", color: "#45B7D1", points: 6, impressiveness: 3, year: "2022-2025" },
    { id: "alabama", name: "Alabama", type: "location", location: "United States", description: "State in the United States", color: "#45B7D1", points: 6, impressiveness: 3, year: "2023-2024" },
    { id: "shimla", name: "Shimla, HP", type: "location", location: "India", description: "City in Himachal Pradesh, India", color: "#45B7D1", points: 6, impressiveness: 4, year: "2015" },

    // Projects
    { id: "krypte", name: "Krypte", type: "project", location: "AI Project", description: "AI without the trust burden", color: "#96CEB4", points: 25, impressiveness: 10, url: "https://www.krypte.ai"},
    { id: "assurenow", name: "AssureNow", type: "project", location: "Healthcare", description: "Medication adherence platform", color: "#96CEB4", points: 20, impressiveness: 8, url: "http://assurenow.co/" },
    { id: "drug-monitor", name: "Drug Monitor", type: "project", location: "Government", description: "Global FDA manufacturing dashboard", color: "#96CEB4", points: 22, impressiveness: 9, url: "https://github.com/mbansal2006/drug_monitor" },
    { id: "regulations-scraper", name: "Regulations Scraper", type: "project", location: "Government", description: "Public comment analysis tool", color: "#96CEB4", points: 16, impressiveness: 6, url: "https://regulations-comment-scraper.streamlit.app/" },
    { id: "treasury-tool", name: "Internal Treasury Tool", type: "project", location: "Government", description: "Contract vehicle tracking system", color: "#96CEB4", points: 20, impressiveness: 7, url: "https://home.treasury.gov/system/files/236/20241106-PCLIA-ServiceNow-508.pdf" },
    { id: "health-economics", name: "Prior Authorization Research", type: "project", location: "Research", description: "The Retina Institute", color: "#96CEB4", points: 15, impressiveness: 7, url: "https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2805678" },

    // Achievements
    { id: "ai-frontier", name: "AI Frontier", type: "achievement", location: "Portfolio", description: "Interactive AI frontier visualization", color: "#FFEAA7", points: 30, impressiveness: 9},
    { id: "why", name: "Why Things Must Happen", type: "achievement", location: "Portfolio", description: "Explores what that might mean for memory, intelligence, and meaning.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    { id: "care", name: "The First Machine that Cared", type: "achievement", location: "Portfolio", description: "A case for models that care.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    { id: "hashtag", name: "The Worst Invention of the 21st Century", type: "achievement", location: "Portfolio", description: "A critique of the hashtag.", color: "#FFEAA7", points: 25, impressiveness: 7 },
    { id: "stakes", name: "The Stakes of the AI Race", type: "achievement", location: "Portfolio", description: "Reflecting on the AI race.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    { id: "intel", name: "The Endurance of Intelligence", type: "achievement", location: "Portfolio", description: "Reflections on the future of intelligence.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    
  ];

  // Generate all experiences on the board
  const generateFood = useCallback(() => {
    const newFood: Experience[] = [];
    const availablePositions: Position[] = [];
    
    // Generate all possible positions
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        // Skip center area where snake starts
        if (Math.abs(x - 5) > 2 || Math.abs(y - 5) > 2) {
          availablePositions.push({ x, y });
        }
      }
    }
    
    // Shuffle positions
    for (let i = availablePositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // Place all experiences on the board
    experiences.forEach((experience, index) => {
      if (index < availablePositions.length) {
        newFood.push({ ...experience, ...availablePositions[index] });
      }
    });
    
    setFood(newFood);
  }, []);

  // Check collision
  const checkCollision = useCallback((head: Position) => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Self collision
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        
        // Move head
        head.x += direction.x;
        head.y += direction.y;
        
        // Check collision
        if (checkCollision(head)) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
          }
          return prevSnake;
        }
        
        newSnake.unshift(head);
        
                          // Check food collision
         const foodIndex = food.findIndex(f => f.x === head.x && f.y === head.y);
         if (foodIndex !== -1) {
           const eatenFood = food[foodIndex];
           setScore(prev => prev + eatenFood.points);
           setCollectedExperiences(prev => [...prev, eatenFood]);
           setGameSpeed(prev => Math.max(50, prev - 1)); // Speed up less aggressively
           
           // Remove eaten food
           const newFood = [...food];
           newFood.splice(foodIndex, 1);
           setFood(newFood);
           
           // Check if all experiences collected
           if (newFood.length === 0) {
             setGameOver(true);
             if (score + eatenFood.points > highScore) {
               setHighScore(score + eatenFood.points);
             }
           }
         } else {
           newSnake.pop();
         }
        
        return newSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, direction, food, checkCollision, generateFood, gameSpeed, score, highScore, snake]);

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    switch (event.key) {
      case 'ArrowUp':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      case 'Enter':
        // Find food at current position
        const currentFood = food.find(f => f.x === snake[0].x && f.y === snake[0].y);
        if (currentFood) {
          setSelectedExperience(currentFood);
        }
        break;
      case 'Escape':
        setSelectedExperience(null);
        break;
    }
  }, [gameStarted, gameOver, direction, food, snake]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 5, y: 5 }]);
    setDirection({ x: 1, y: 0 });
    setGameSpeed(100);
    setSelectedExperience(null);
    setCollectedExperiences([]);
    generateFood();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setSnake([{ x: 5, y: 5 }]);
    setDirection({ x: 1, y: 0 });
    setGameSpeed(100);
    setSelectedExperience(null);
    setFood([]);
    setCollectedExperiences([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school': return '🎓';
      case 'job': return '💼';
      case 'location': return '🌍';
      case 'project': return '🚀';
      case 'achievement': return '📄';
      default: return '⭐';
    }
  };

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('mb@mahirbansal.com');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (err) {
      console.error('Failed to copy email to clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 font-mono">
      {/* Navigation Bar */}
      <div className="bg-yellow-900 border-b-2 border-yellow-400 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">MAHIR BANSAL</h1>
          <div className="text-right">
            <div>SCORE: {score}</div>
            <div>HIGH SCORE: {highScore}</div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/thoughts"
            className="px-4 py-2 bg-yellow-600 text-black font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded"
          >
            📝 Writings
          </Link>
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
          <button
            onClick={copyEmailToClipboard}
            className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border border-red-400 rounded"
          >
            📧 Email
          </button>
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
        </div>
      </div>

      {/* Email Copy Alert */}
      {showAlert && (
        <div className="fixed top-4 right-4 bg-yellow-900 border-2 border-yellow-400 text-yellow-300 px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <div className="font-bold">Email Copied!</div>
              <div className="text-sm">mb@mahirbansal.com copied to clipboard</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Game Board */}
        <div className="flex-1 p-4">
          {!gameStarted ? (
            <div className="text-center space-y-6">
              {/* Intro Section */}
              <div className="mb-8 text-left max-w-3xl mx-auto bg-yellow-900 p-6 rounded-lg border border-yellow-400">
                <h2 className="text-2xl font-bold mb-4 text-yellow-300">Hey! I'm Mahir 👋</h2>
                <div className="text-yellow-200 space-y-3 text-sm leading-relaxed">
                  <p>
                    I'm a math and computer science student at WashU, and I spend most of my time thinking about where we're headed. 
                    For me that means asking about what future we want and how do we get there with what's in our toolbox.
                  </p>
                  <p>
                    Over the past few years, I've been bouncing between internships and projects trying to learn more about each of these tools 
                    (tech, government, and markets). I've found that I'm most excited by applying those tools in high-stakes problems like health or development.
                  </p>
                  <p>
                    Right now, I'm building <a href="https://www.krypte.ai" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 underline">Krypte</a> - 
                    trying to build AI systems that protect your privacy.
                  </p>
                  <p>
                    Wild ride so far, and hopefully just getting started. Love to chat.
                  </p>
                </div>
              </div>

              <div className="text-4xl mb-8">🐍</div>
              <h2 className="text-3xl font-bold">SNAKE GAME</h2>
              <div className="text-lg space-y-2">
                <p>Use arrows to move the snake, eat food, and avoid obstacles</p>
              </div>
              <div className="text-lg space-y-1 text-yellow-300">
                <p>Collect schools, jobs, and projects</p>
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-600 text-black font-bold border-2 border-yellow-400 hover:bg-yellow-700 transition-colors"
              >
                PLAY GAME
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              {/* Game Grid */}
              <div 
                className="border-2 border-yellow-400 bg-black"
                style={{
                  width: GRID_SIZE * CELL_SIZE,
                  height: GRID_SIZE * CELL_SIZE,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
                }}
              >
                {/* Grid cells */}
                {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  
                  // Check if this is snake
                  const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
                  const isSnakeHead = snakeIndex === 0;
                  const isSnakeBody = snakeIndex > 0;
                  
                  // Check if this is food
                  const currentFood = food.find(f => f.x === x && f.y === y);
                  
                  return (
                    <div
                      key={i}
                      className={`border border-yellow-800 ${
                        isSnakeHead ? 'bg-yellow-400' : 
                        isSnakeBody ? 'bg-yellow-600' : 
                        currentFood ? 'bg-yellow-400' : 
                        'bg-black'
                      }`}
                      style={{ 
                        width: CELL_SIZE, 
                        height: CELL_SIZE,
                        backgroundColor: currentFood ? currentFood.color : undefined
                      }}
                    >
                      {isSnakeHead && <div className="text-black text-center text-sm font-bold">👤</div>}
                      {isSnakeBody && <div className="text-black text-center text-sm">●</div>}
                      {currentFood && (
                        <div className="text-black text-center text-sm font-bold">
                          {getTypeIcon(currentFood.type)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
              <div className="text-center space-y-4 bg-yellow-900 p-8 border-2 border-yellow-400 max-w-4xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-3xl font-bold">
                  {collectedExperiences.length === experiences.length ? "🎉 CAREER COMPLETE! 🎉" : "GAME OVER!"}
                </h2>
                <p className="text-xl">Final Score: {score}</p>
                
                {collectedExperiences.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      {[...collectedExperiences]
                        .sort((a, b) => b.impressiveness - a.impressiveness)
                        .map((exp, index) => (
                          <div key={index} className="bg-yellow-800 p-3 rounded border border-yellow-600">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getTypeIcon(exp.type)}</span>
                              <span className="font-bold text-yellow-300">{exp.name}</span>
                              <span className="text-yellow-400 text-sm font-bold"></span>
                            </div>
                            <p className="text-yellow-200 text-sm mb-1">{exp.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-yellow-400 text-xs">{exp.location}</span>
                              <span className="text-yellow-400 text-xs">+{exp.points} pts</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 space-x-4">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-yellow-600 text-black font-bold border border-yellow-400 hover:bg-yellow-700 transition-colors"
                  >
                    PLAY AGAIN
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-red-600 text-white font-bold border border-red-400 hover:bg-red-700 transition-colors"
                  >
                    MAIN MENU
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Experience Info Panel */}
        <div className="w-96 bg-yellow-900 border-l-2 border-yellow-400 p-4 overflow-y-auto">
          {selectedExperience ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedExperience.name}</h2>
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="text-yellow-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(selectedExperience.type)}</span>
                <span className="text-yellow-300 text-sm">{selectedExperience.location}</span>
              </div>
              
              <p className="text-yellow-300 text-sm">{selectedExperience.description}</p>
              
              {selectedExperience.year && (
                <div className="text-yellow-400 text-sm">
                  <strong>Year:</strong> {selectedExperience.year}
                </div>
              )}
              
              <div className="text-yellow-400 text-sm">
                <strong>Points:</strong> {selectedExperience.points}
              </div>

              {selectedExperience.details && (
                <div className="space-y-2">
                  <h3 className="font-bold text-yellow-400">DETAILS:</h3>
                  {selectedExperience.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-yellow-400">▶</span>
                      <span className="text-yellow-200 text-sm">{detail}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedExperience.url && (
                <div className="mt-4">
                  <a 
                    href={selectedExperience.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors border border-blue-400"
                  >
                    View Project →
                  </a>
                </div>
              )}

              {selectedExperience.type === 'achievement' && selectedExperience.id === 'writings' && (
                <div className="mt-4">
                  <Link
                    to="/thoughts"
                    className="inline-block px-4 py-2 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors border border-purple-400"
                  >
                    Read Writings →
                  </Link>
                </div>
              )}

              {selectedExperience.type === 'achievement' && selectedExperience.id === 'ai-frontier' && (
                <div className="mt-4">
                  <Link
                    to="/frontier"
                    className="inline-block px-4 py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors border border-orange-400"
                  >
                    Explore AI Frontier →
                  </Link>
                </div>
              )}

              {selectedExperience.type === 'achievement' && selectedExperience.id === 'linkedin' && (
                <div className="mt-4">
                  <a 
                    href="https://www.linkedin.com/in/mahirbansal/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors border border-blue-400"
                  >
                    Connect on LinkedIn →
                  </a>
                </div>
              )}

              {selectedExperience.type === 'achievement' && selectedExperience.id === 'email' && (
                <div className="mt-4">
                  <a 
                    href="mailto:mb@mahirbansal.com"
                    className="inline-block px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border border-red-400"
                  >
                    Send Email →
                  </a>
                </div>
              )}

              {selectedExperience.type === 'achievement' && selectedExperience.id === 'resume' && (
                <div className="mt-4">
                  <a 
                    href="https://drive.google.com/file/d/1roTioVMkGKi3oM-4IJn8BsYVifJdzhPV/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors border border-orange-400"
                  >
                    Download Resume →
                  </a>
                </div>
              )}
            </div>
          ) : (
                          <div className="text-center space-y-4">
                <div className="text-4xl">🍎</div>
                <h2 className="text-xl font-bold">EXPERIENCES</h2>
                <p className="text-yellow-300 text-sm">
                  {experiences.length} experiences are on the board.
                </p>
                <div className="space-y-2 text-left">
                  <div className="text-sm">
                    <span className="text-yellow-400">🎓</span> Schools
                    <span className="ml-4 text-yellow-400">💼</span> Jobs
                    <span className="ml-4 text-yellow-400">🌍</span> Places Lived
                  </div>
                  <div className="text-sm">
                    <span className="text-yellow-400">🚀</span> Projects
                    <span className="ml-4 text-yellow-400">📄</span> Essays
                  </div>
                </div>
              </div>
          )}
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

export default Index;
