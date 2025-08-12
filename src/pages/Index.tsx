import { useState, useEffect, useCallback, useRef } from "react";
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
  const [botSnake, setBotSnake] = useState<Position[]>([{ x: 15, y: 15 }]);
  const [botDirection, setBotDirection] = useState<Position>({ x: -1, y: 0 });
  const [botScore, setBotScore] = useState(0);
  const [botCollectedExperiences, setBotCollectedExperiences] = useState<Experience[]>([]);
  const [gameMode, setGameMode] = useState<'single' | 'competitive'>('competitive');
  const [winner, setWinner] = useState<'player' | 'bot' | 'tie' | null>(null);
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
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Tetris game state
  const [tetrisBoard, setTetrisBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][]; x: number; y: number; type: string } | null>(null);
  const [nextPiece, setNextPiece] = useState<string>('');
  const [tetrisScore, setTetrisScore] = useState(0);
  const [tetrisLevel, setTetrisLevel] = useState(1);
  const [tetrisLines, setTetrisLines] = useState(0);
  const [tetrisGameStarted, setTetrisGameStarted] = useState(false);
  const [tetrisGameOver, setTetrisGameOver] = useState(false);
  const [tetrisPaused, setTetrisPaused] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Experience | null>(null);

  // Tetris bot state
  const [tetrisBotBoard, setTetrisBotBoard] = useState<number[][]>([]);
  const [tetrisBotPiece, setTetrisBotPiece] = useState<{ shape: number[][]; x: number; y: number; type: string } | null>(null);
  const [tetrisBotScore, setTetrisBotScore] = useState(0);
  const [tetrisBotLines, setTetrisBotLines] = useState(0);
  const [tetrisWinner, setTetrisWinner] = useState<'player' | 'bot' | null>(null);
  // Shared 7-bag queue for fair/synchronized piece order
  const [tetrisQueue, setTetrisQueue] = useState<string[]>([]);
  const tetrisQueueRef = useRef<string[]>([]);

  // RL bot (epsilon-greedy linear Q-learning)
  const rlWeightsRef = useRef<number[]>([
    -0.5,  // bias
    -0.7,  // aggregate height
    -1.0,  // holes
    -0.2   // bumpiness
  ]);
  const epsilonRef = useRef(0.10);  // exploration
  const alphaRef = useRef(0.05);    // learning rate
  const gammaRef = useRef(0.90);    // discount

  const prevPhiRef = useRef<number[] | null>(null);
  const prevQRef = useRef<number | null>(null);

  const GRID_SIZE = 20;
  const CELL_SIZE = 25;
  const TETRIS_WIDTH = 10;
  const TETRIS_HEIGHT = 20;

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
    { id: "adaptive-sycophancy", name: "Adaptive Sycophancy", type: "achievement", location: "Portfolio", description: "A case for adaptive guardrails.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    
  ];

  // Tetris pieces with project themes
  const tetrisPieces = {
    I: {
      shape: [[1, 1, 1, 1]],
      color: "#FF6B6B", // Red - Krypte
      project: "krypte"
    },
    O: {
      shape: [[1, 1], [1, 1]],
      color: "#4ECDC4", // Teal - AssureNow
      project: "assurenow"
    },
    T: {
      shape: [[0, 1, 0], [1, 1, 1]],
      color: "#96CEB4", // Green - Drug Monitor
      project: "drug-monitor"
    },
    S: {
      shape: [[0, 1, 1], [1, 1, 0]],
      color: "#45B7D1", // Blue - Regulations Scraper
      project: "regulations-scraper"
    },
    Z: {
      shape: [[1, 1, 0], [0, 1, 1]],
      color: "#FFEAA7", // Yellow - Treasury Tool
      project: "treasury-tool"
    },
    J: {
      shape: [[1, 0, 0], [1, 1, 1]],
      color: "#FF6B6B", // Red - Health Economics
      project: "health-economics"
    },
    L: {
      shape: [[0, 0, 1], [1, 1, 1]],
      color: "#4ECDC4", // Teal - AI Frontier
      project: "ai-frontier"
    }
  };

  const pieceTypes = Object.keys(tetrisPieces);

  // 7-bag helpers (must be declared before piece generators)
  const generateBag = useCallback(() => {
    const bag = [...pieceTypes];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }, [pieceTypes]);

  const ensureQueue = useCallback(() => {
    let q = tetrisQueueRef.current.slice();
    while (q.length < 7) q = q.concat(generateBag());
    tetrisQueueRef.current = q;
    setTetrisQueue(q.slice());
  }, [generateBag]);

  const drawNextType = useCallback(() => {
    ensureQueue();
    const [type, ...rest] = tetrisQueueRef.current;
    tetrisQueueRef.current = rest;
    setTetrisQueue(rest.slice());
    return type as string;
  }, [ensureQueue]);

  const peekNextType = useCallback(() => {
    ensureQueue();
    return (tetrisQueueRef.current[0] as string) || pieceTypes[0];
  }, [ensureQueue, pieceTypes]);

  // Tetris game functions
  const initializeTetrisBoard = useCallback(() => {
    const board = Array(TETRIS_HEIGHT).fill(null).map(() => Array(TETRIS_WIDTH).fill(0));
    setTetrisBoard(board);
  }, []);

  const generateNewPiece = useCallback(() => {
    const type = drawNextType();
    const piece = tetrisPieces[type as keyof typeof tetrisPieces];
    return {
      shape: piece.shape,
      x: Math.floor(TETRIS_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0,
      type
    };
  }, [drawNextType, tetrisPieces]);

  const checkTetrisCollision = useCallback((piece: { shape: number[][]; x: number; y: number }, board: number[][]) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;
          
          if (newX < 0 || newX >= TETRIS_WIDTH || newY >= TETRIS_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const placePiece = useCallback((piece: { shape: number[][]; x: number; y: number; type: string }, board: number[][]) => {
    const newBoard = board.map(row => [...row]);
    const projectId = tetrisPieces[piece.type as keyof typeof tetrisPieces].project;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = 1;
          }
        }
      }
    }
    
    // Find the project and show it
    const project = experiences.find(exp => exp.id === projectId);
    if (project) {
      setSelectedProject(project);
      setTimeout(() => setSelectedProject(null), 3000); // Hide after 3 seconds
    }
    
    return newBoard;
  }, [tetrisPieces, experiences]);

  const clearLines = useCallback((board: number[][]) => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell === 1)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    // Add empty rows at the top
    while (newBoard.length < TETRIS_HEIGHT) newBoard.unshift(Array(TETRIS_WIDTH).fill(0));

    if (linesCleared > 0) {
      // Classic Tetris scoring for clears
      const base = linesCleared === 1 ? 100 : linesCleared === 2 ? 300 : linesCleared === 3 ? 500 : 800;
      setTetrisScore(prev => prev + base * tetrisLevel);
      setTetrisLines(prev => {
        const updated = prev + linesCleared;
        setTetrisLevel(Math.floor(updated / 10) + 1);
        return updated;
      });
    }
    return newBoard;
  }, [tetrisLevel]);

  const clearBotLines = useCallback((board: number[][]) => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell === 1)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    // Add empty rows at the top
    while (newBoard.length < TETRIS_HEIGHT) newBoard.unshift(Array(TETRIS_WIDTH).fill(0));

    if (linesCleared > 0) {
      const base = linesCleared === 1 ? 100 : linesCleared === 2 ? 300 : linesCleared === 3 ? 500 : 800;
      setTetrisBotScore(prev => prev + base * tetrisLevel);
      setTetrisBotLines(prev => prev + linesCleared);
    }
    return newBoard;
  }, [tetrisLevel]);

  const rotatePiece = useCallback((piece: { shape: number[][]; x: number; y: number; type: string }) => {
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    return { ...piece, shape: rotated };
  }, []);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || tetrisPaused) return false;
    
    const movedPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy };
    
    if (!checkTetrisCollision(movedPiece, tetrisBoard)) {
      setCurrentPiece(movedPiece);
      return true;
    } else if (dy > 0) {
      // Piece landed - only place if it's not at the very top
      if (currentPiece.y > 0) {
        const newBoard = placePiece(currentPiece, tetrisBoard);
        const clearedBoard = clearLines(newBoard);
        setTetrisBoard(clearedBoard);
        
        // Spawn player next piece from shared queue
        const newPiece = generateNewPiece();
        if (checkTetrisCollision(newPiece, clearedBoard)) {
          setTetrisGameOver(true);
        } else {
          setCurrentPiece(newPiece);
        }
        // Update preview
        setNextPiece(peekNextType());
      } else {
        // Game over if piece can't move from top
        setTetrisGameOver(true);
      }
      return false;
    }
    return false;
  }, [currentPiece, tetrisBoard, tetrisPaused, checkTetrisCollision, placePiece, clearLines, pieceTypes, generateNewPiece]);

  const startTetrisGame = () => {
    // Initialize clean boards
    const cleanBoard = Array(TETRIS_HEIGHT).fill(null).map(() => Array(TETRIS_WIDTH).fill(0));
    setTetrisBoard(cleanBoard);
    setTetrisBotBoard(cleanBoard);
    
    // Reset game state
    setTetrisScore(0);
    setTetrisLevel(1);
    setTetrisLines(0);
    setTetrisGameOver(false);
    setTetrisPaused(false);
    setSelectedProject(null);
    setTetrisBotScore(0);
    setTetrisBotLines(0);
    setTetrisWinner(null);
    // Reset 7-bag queue
    tetrisQueueRef.current = [];
    setTetrisQueue([]);
    ensureQueue();
    
    // Generate first pieces
    const firstPiece = generateNewPiece();
    const botPiece = generateNewPiece();
    const nextPieceType = peekNextType();
    
    setCurrentPiece(firstPiece);
    setTetrisBotPiece(botPiece);
    setNextPiece(nextPieceType);
    
    // Start the game last
    setTetrisGameStarted(true);
  };

  const resetTetrisGame = () => {
    setTetrisGameStarted(false);
    setTetrisGameOver(false);
    setTetrisPaused(false);
    setTetrisScore(0);
    setTetrisLevel(1);
    setTetrisLines(0);
    setCurrentPiece(null);
    setNextPiece('');
    setSelectedProject(null);
    setTetrisBoard([]);
    setTetrisBotBoard([]);
    setTetrisBotPiece(null);
    setTetrisBotScore(0);
    setTetrisBotLines(0);
    setTetrisWinner(null);
  };

  // Tetris bot AI functions
  const calculateTetrisBotMove = useCallback((botBoard: number[][], botPiece: { shape: number[][]; x: number; y: number; type: string }) => {
    let bestScore = -Infinity;
    let bestMove = { x: botPiece.x, rotation: 0 };
    
    // Try all possible rotations and positions
    for (let rotation = 0; rotation < 4; rotation++) {
      let rotatedPiece = { ...botPiece };
      for (let r = 0; r < rotation; r++) {
        rotatedPiece = rotatePiece(rotatedPiece);
      }
      
      // Try all horizontal positions
      for (let x = -2; x <= TETRIS_WIDTH + 2; x++) {
        const testPiece = { ...rotatedPiece, x };
        
        // Find the lowest valid position
        let y = botPiece.y;
        while (!checkTetrisCollision({ ...testPiece, y }, botBoard)) {
          y++;
        }
        y--; // Move back up one step
        
        if (y >= 0) {
                  const testBoard = placePiece({ ...testPiece, y }, botBoard);
        const clearedBoard = clearBotLines(testBoard);
        const score = evaluateTetrisBoard(clearedBoard);
          
          if (score > bestScore) {
            bestScore = score;
            bestMove = { x, rotation };
          }
        }
      }
    }
    
    return bestMove;
  }, [rotatePiece, checkTetrisCollision, placePiece, clearLines]);

  const evaluateTetrisBoard = useCallback((board: number[][]) => {
    let score = 0;
    
    // Prefer lower heights
    for (let x = 0; x < TETRIS_WIDTH; x++) {
      for (let y = 0; y < TETRIS_HEIGHT; y++) {
        if (board[y][x]) {
          score -= (TETRIS_HEIGHT - y) * 10;
          break;
        }
      }
    }
    
    // Prefer complete lines
    for (let y = 0; y < TETRIS_HEIGHT; y++) {
      if (board[y].every(cell => cell === 1)) {
        score += 1000;
      }
    }
    
    // Avoid holes
    for (let x = 0; x < TETRIS_WIDTH; x++) {
      let foundBlock = false;
      for (let y = 0; y < TETRIS_HEIGHT; y++) {
        if (board[y][x]) {
          foundBlock = true;
        } else if (foundBlock) {
          score -= 50; // Penalty for holes
        }
      }
    }
    
    return score;
  }, []);

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

  // Bot AI logic - calculates optimal direction
  const calculateBotDirection = useCallback(() => {
    const botHead = botSnake[0];
    
    // Find nearest food
    let nearestFood = null;
    let minDistance = Infinity;
    
    food.forEach(f => {
      const distance = Math.abs(f.x - botHead.x) + Math.abs(f.y - botHead.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearestFood = f;
      }
    });
    
    if (!nearestFood) return botDirection;
    
    // Simple pathfinding - move towards food
    const dx = nearestFood.x - botHead.x;
    const dy = nearestFood.y - botHead.y;
    
    // Avoid walls and self-collision
    const possibleMoves = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
    ].filter(move => {
      const newHead = { x: botHead.x + move.x, y: botHead.y + move.y };
      return newHead.x >= 0 && newHead.x < GRID_SIZE && 
             newHead.y >= 0 && newHead.y < GRID_SIZE &&
             !botSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y) &&
             !snake.some(segment => segment.x === newHead.x && segment.y === newHead.y);
    });
    
    if (possibleMoves.length === 0) return botDirection;
    
    // Prefer moves towards food
    const preferredMoves = possibleMoves.filter(move => {
      const newHead = { x: botHead.x + move.x, y: botHead.y + move.y };
      const newDistance = Math.abs(nearestFood!.x - newHead.x) + Math.abs(nearestFood!.y - newHead.y);
      return newDistance < minDistance;
    });
    
    return preferredMoves.length > 0 ? preferredMoves[0] : possibleMoves[0];
  }, [botSnake, food, botDirection, snake]);

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
      // Player snake movement
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        
        // Move head
        head.x += direction.x;
        head.y += direction.y;
        
        // Check collision with walls, self, or bot
        if (checkCollision(head) || 
            botSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setWinner('bot');
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
            // Compare scores
            const finalPlayerScore = score + eatenFood.points;
            const finalBotScore = botScore;
            
            if (finalPlayerScore > finalBotScore) {
              setWinner('player');
            } else if (finalBotScore > finalPlayerScore) {
              setWinner('bot');
            } else {
              setWinner('tie');
            }
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

      // Bot snake movement
      setBotSnake(prevBotSnake => {
        const newBotSnake = [...prevBotSnake];
        const botHead = { ...newBotSnake[0] };
        
        // Calculate bot direction
        const newBotDirection = calculateBotDirection();
        setBotDirection(newBotDirection);
        
        // Move bot head
        botHead.x += newBotDirection.x;
        botHead.y += newBotDirection.y;
        
        // Check bot collision with walls, self, or player
        if (botHead.x < 0 || botHead.x >= GRID_SIZE || 
            botHead.y < 0 || botHead.y >= GRID_SIZE ||
            newBotSnake.slice(1).some(segment => segment.x === botHead.x && segment.y === botHead.y) ||
            snake.some(segment => segment.x === botHead.x && segment.y === botHead.y)) {
          // Bot dies - player wins
          setWinner('player');
          setGameOver(true);
          return prevBotSnake;
        }
        
        newBotSnake.unshift(botHead);
        
        // Check bot food collision
        const botFoodIndex = food.findIndex(f => f.x === botHead.x && f.y === botHead.y);
        if (botFoodIndex !== -1) {
          const eatenFood = food[botFoodIndex];
          setBotScore(prev => prev + eatenFood.points);
          setBotCollectedExperiences(prev => [...prev, eatenFood]);
          
          // Remove eaten food
          const newFood = [...food];
          newFood.splice(botFoodIndex, 1);
          setFood(newFood);
          
          // Check if all food collected
          if (newFood.length === 0) {
            // Game ends - compare scores
            const finalPlayerScore = score;
            const finalBotScore = botScore + eatenFood.points;
            
            if (finalPlayerScore > finalBotScore) {
              setWinner('player');
            } else if (finalBotScore > finalPlayerScore) {
              setWinner('bot');
            } else {
              setWinner('tie');
            }
            setGameOver(true);
          }
        } else {
          newBotSnake.pop();
        }
        
        return newBotSnake;
      });
    }, gameSpeed);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, direction, food, calculateBotDirection, gameSpeed, score, highScore, snake, botSnake, botScore, checkCollision]);

  // Tetris game loop
  useEffect(() => {
    if (!tetrisGameStarted || tetrisGameOver || tetrisPaused) return;

    const tetrisLoop = setInterval(() => {
      // Player piece movement
      movePiece(0, 1);
      
      // Bot piece movement (Q-learning, greedy)
      if (tetrisBotPiece) {
        const choice = chooseTetrisBotMoveRL(tetrisBotBoard, tetrisBotPiece);
        if (!choice) {
          setTetrisWinner('player');
          setTetrisGameOver(true);
          return;
        }

        // TD update using previous (phi, Q) if available
        const reward =
          choice.linesCleared * 1.0 // positive for clearing lines
          // small regularizers from next state's features (costs)
          - choice.phiNext[1] * 0.5    // aggregate height
          - choice.phiNext[2] * 1.0    // holes
          - choice.phiNext[3] * 0.2;   // bumpiness

        if (prevPhiRef.current && prevQRef.current !== null) {
          const target = reward + gammaRef.current * choice.qNext;
          const delta = target - prevQRef.current;
          // w = w + alpha * delta * phi_prev
          const w = rlWeightsRef.current.slice();
          for (let i = 0; i < w.length; i++) w[i] += alphaRef.current * delta * prevPhiRef.current[i];
          rlWeightsRef.current = w;
          // Optional: decay epsilon a bit
          epsilonRef.current = Math.max(0.02, epsilonRef.current * 0.999);
        }

        // Execute chosen action on the real board
        let rotatedBotPiece = { ...tetrisBotPiece };
        for (let r = 0; r < choice.rotation; r++) rotatedBotPiece = rotatePiece(rotatedBotPiece);
        rotatedBotPiece.x = choice.x;

        // Drop down using collision check to match simulation
        let botY = rotatedBotPiece.y;
        while (!checkTetrisCollision({ ...rotatedBotPiece, y: botY + 1 }, tetrisBotBoard)) botY++;

        const newBotBoard = placePiece({ ...rotatedBotPiece, y: botY }, tetrisBotBoard);
        const clearedBotBoard = clearBotLines(newBotBoard);
        setTetrisBotBoard(clearedBotBoard);

        // Prepare next state for learning (phi, Q)
        prevPhiRef.current = choice.phiNext;
        prevQRef.current = choice.qNext;

        // Generate new bot piece from shared queue
        const newBotPiece = generateNewPiece();
        if (checkTetrisCollision(newBotPiece, clearedBotBoard)) {
          setTetrisWinner('player');
          setTetrisGameOver(true);
        } else {
          setTetrisBotPiece(newBotPiece);
        }
      }
    }, Math.max(120, 700 - (tetrisLevel * 60)));

    return () => clearInterval(tetrisLoop);
  }, [tetrisGameStarted, tetrisGameOver, tetrisPaused, tetrisLevel, movePiece, tetrisBotPiece, tetrisBotBoard, calculateTetrisBotMove, rotatePiece, checkTetrisCollision, placePiece, clearBotLines, generateNewPiece]);

  // Tetris keyboard controls
  useEffect(() => {
    const handleTetrisKeyPress = (event: KeyboardEvent) => {
      if (!tetrisGameStarted || tetrisGameOver || tetrisPaused) return;

      // Prevent default behavior for game keys to avoid page scrolling
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          const rotated = rotatePiece(currentPiece!);
          if (!checkTetrisCollision(rotated, tetrisBoard)) {
            setCurrentPiece(rotated);
          }
          break;
        case ' ':
          // Hard drop - move piece all the way down
          if (currentPiece) {
            let dropDistance = 0;
            while (!checkTetrisCollision({ ...currentPiece, y: currentPiece.y + dropDistance + 1 }, tetrisBoard)) {
              dropDistance++;
            }
            if (dropDistance > 0) {
              movePiece(0, dropDistance);
            }
          }
          break;
        case 'p':
        case 'P':
          setTetrisPaused(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleTetrisKeyPress);
    return () => document.removeEventListener('keydown', handleTetrisKeyPress);
  }, [tetrisGameStarted, tetrisGameOver, tetrisPaused, currentPiece, movePiece, rotatePiece, checkTetrisCollision]);

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    // Prevent default behavior for game keys to avoid page scrolling
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
    }

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
    // Only add keyboard listener on desktop
    if (window.innerWidth >= 1024) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleKeyPress]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setBotScore(0);
    setSnake([{ x: 5, y: 5 }]);
    setBotSnake([{ x: 15, y: 15 }]);
    setDirection({ x: 1, y: 0 });
    setBotDirection({ x: -1, y: 0 });
    setGameSpeed(100);
    setSelectedExperience(null);
    setCollectedExperiences([]);
    setBotCollectedExperiences([]);
    setWinner(null);
    generateFood();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setBotScore(0);
    setSnake([{ x: 5, y: 5 }]);
    setBotSnake([{ x: 15, y: 15 }]);
    setDirection({ x: 1, y: 0 });
    setBotDirection({ x: -1, y: 0 });
    setGameSpeed(100);
    setSelectedExperience(null);
    setFood([]);
    setCollectedExperiences([]);
    setBotCollectedExperiences([]);
    setWinner(null);
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

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !gameStarted || gameOver) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30; // Minimum distance for a swipe

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && direction.x === 0) {
          // Swipe right
          setDirection({ x: 1, y: 0 });
        } else if (deltaX < 0 && direction.x === 0) {
          // Swipe left
          setDirection({ x: -1, y: 0 });
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && direction.y === 0) {
          // Swipe down
          setDirection({ x: 0, y: 1 });
        } else if (deltaY < 0 && direction.y === 0) {
          // Swipe up
          setDirection({ x: 0, y: -1 });
        }
      }
    }

    setTouchStart(null);
  };

  // Initialize Tetris boards on component mount
  // Initialize empty boards for display (no pieces until game starts)
  useEffect(() => {
    if (!tetrisBoard.length) {
      const initialBoard = Array(TETRIS_HEIGHT).fill(null).map(() => Array(TETRIS_WIDTH).fill(0));
      setTetrisBoard(initialBoard);
      setTetrisBotBoard(initialBoard);
    }
  }, [tetrisBoard.length]);

  // ---- RL helpers (pure, no state side-effects) ----
  const cloneBoard = (board: number[][]) => board.map(r => [...r]);

  const placePiecePure = (piece: { shape: number[][]; x: number; y: number }, board: number[][]) => {
    const newBoard = cloneBoard(board);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const bx = piece.x + x, by = piece.y + y;
          if (by >= 0 && by < TETRIS_HEIGHT && bx >= 0 && bx < TETRIS_WIDTH) {
            newBoard[by][bx] = 1;
          }
        }
      }
    }
    return newBoard;
  };

  const clearLinesPure = (board: number[][]): { cleared: number; board: number[][] } => {
    let cleared = 0;
    const kept = board.filter(row => {
      const full = row.every(c => c === 1);
      if (full) cleared++;
      return !full;
    });
    while (kept.length < TETRIS_HEIGHT) kept.unshift(Array(TETRIS_WIDTH).fill(0));
    return { cleared, board: kept };
  };

  const columnHeights = (board: number[][]) => {
    const heights = Array(TETRIS_WIDTH).fill(0);
    for (let x = 0; x < TETRIS_WIDTH; x++) {
      for (let y = 0; y < TETRIS_HEIGHT; y++) {
        if (board[y][x]) { heights[x] = TETRIS_HEIGHT - y; break; }
      }
    }
    return heights;
  };

  const countHoles = (board: number[][]) => {
    let holes = 0;
    for (let x = 0; x < TETRIS_WIDTH; x++) {
      let seenBlock = false;
      for (let y = 0; y < TETRIS_HEIGHT; y++) {
        if (board[y][x]) seenBlock = true;
        else if (seenBlock && !board[y][x]) holes++;
      }
    }
    return holes;
  };

  const bumpiness = (heights: number[]) => {
    let sum = 0;
    for (let x = 0; x < TETRIS_WIDTH - 1; x++) sum += Math.abs(heights[x] - heights[x + 1]);
    return sum;
  };

  const featuresFromBoard = (board: number[][]): number[] => {
    const h = columnHeights(board);
    const aggHeight = h.reduce((a, b) => a + b, 0);
    const holes = countHoles(board);
    const bump = bumpiness(h);

    // Normalize to reasonable ranges
    const aggHeightN = aggHeight / (TETRIS_WIDTH * TETRIS_HEIGHT);
    const holesN = holes / (TETRIS_WIDTH * TETRIS_HEIGHT);
    const bumpN = bump / (TETRIS_WIDTH * 2);

    return [1, aggHeightN, holesN, bumpN]; // bias, height, holes, bumpiness
  };

  const dot = (w: number[], x: number[]) => w.reduce((s, wi, i) => s + wi * x[i], 0);

  

  // Enumerate bot actions, epsilon-greedy over Q(s,a) ~= w · phi(s')
  const chooseTetrisBotMoveRL = (
    board: number[][],
    piece: { shape: number[][]; x: number; y: number; type: string }
  ): { x: number; rotation: number; y: number; phiNext: number[]; qNext: number; linesCleared: number; simBoard: number[][] } | null => {
    const candidates: { x: number; rotation: number; y: number; phi: number[]; q: number; linesCleared: number; simBoard: number[][] }[] = [];

    for (let rotation = 0; rotation < 4; rotation++) {
      let rotated = { ...piece };
      for (let r = 0; r < rotation; r++) rotated = rotatePiece(rotated);

      for (let x = -2; x <= TETRIS_WIDTH + 2; x++) {
        const test = { ...rotated, x };
        // Drop to lowest valid y
        let y = test.y;
        while (!checkTetrisCollision({ ...test, y }, board)) y++;
        y--;

        if (y >= 0) {
          const placed = placePiecePure({ ...test, y }, board);
          const { cleared, board: afterClear } = clearLinesPure(placed);
          const phi = featuresFromBoard(afterClear);
          const q = dot(rlWeightsRef.current, phi);
          candidates.push({ x, rotation, y, phi, q, linesCleared: cleared, simBoard: afterClear });
        }
      }
    }

    if (candidates.length === 0) return null;

    // epsilon-greedy
    if (Math.random() < epsilonRef.current) {
      const c = candidates[Math.floor(Math.random() * candidates.length)];
      return { x: c.x, rotation: c.rotation, y: c.y, phiNext: c.phi, qNext: c.q, linesCleared: c.linesCleared, simBoard: c.simBoard };
    }
    candidates.sort((a, b) => b.q - a.q);
    const best = candidates[0];
    return { x: best.x, rotation: best.rotation, y: best.y, phiNext: best.phi, qNext: best.q, linesCleared: best.linesCleared, simBoard: best.simBoard };
  };

  return (
    <div className="min-h-screen bg-black text-yellow-400 font-mono flex flex-col">
      {/* Navigation Bar */}
      <div className="bg-yellow-900 border-b-2 border-yellow-400 p-4">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold">MAHIR BANSAL</h1>
            <div className="text-right text-sm">
              <div>SCORE: {score}</div>
              <div>HIGH: {highScore}</div>
            </div>
          </div>
          
          {/* Mobile Navigation - Compact */}
          <div className="grid grid-cols-4 gap-2">
            <div className="px-2 py-1 bg-black text-white text-xs font-bold border border-yellow-400 rounded text-center opacity-50">
              🏠 Home
            </div>
            <Link
              to="/thoughts"
              className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded text-center"
            >
              📝 Writings
            </Link>
            <Link
              to="/frontier"
              className="px-2 py-1 bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors border border-orange-400 rounded text-center"
            >
              🤖 AI
            </Link>
            <a
              href="https://www.krypte.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors border border-purple-400 rounded text-center"
            >
              🛡️ Krypte
            </a>
            <a
              href="https://www.linkedin.com/in/mahirbansal/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors border border-blue-400 rounded text-center"
            >
              💼 LinkedIn
            </a>
            <button
              onClick={copyEmailToClipboard}
              className="px-2 py-1 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors border border-red-400 rounded text-center"
            >
              📧 Email
            </button>
            <a
              href="https://drive.google.com/file/d/1roTioVMkGKi3oM-4IJn8BsYVifJdzhPV/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors border border-orange-400 rounded text-center"
            >
              📄 Resume
            </a>
            <a
              href="https://github.com/mbansal2006"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-gray-600 text-white text-xs font-bold hover:bg-gray-700 transition-colors border border-gray-400 rounded text-center"
            >
              💻 GitHub
            </a>
            <div className="px-2 py-1 bg-gray-600 text-white text-xs font-bold border border-gray-400 rounded text-center opacity-50">
              🎮 Game
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">MAHIR BANSAL</h1>
            <div className="text-right">
              <div>SCORE: {score}</div>
              <div>HIGH SCORE: {highScore}</div>
            </div>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="px-4 py-2 bg-black text-white font-bold border border-yellow-400 rounded opacity-50">
              🏠 Home
            </div>
            <Link
              to="/thoughts"
              className="px-4 py-2 bg-yellow-600 text-white font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded"
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

      <div className="flex flex-1 flex-col relative">
        {/* Centered Intro Message */}
        <div className="text-center p-6 lg:p-8">
          <div className="max-w-3xl mx-auto bg-yellow-900 p-4 lg:p-6 rounded-lg border border-yellow-400">
                <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-yellow-300">Hey! I'm Mahir 👋</h2>
                <div className="text-yellow-200 space-y-2 lg:space-y-3 text-xs lg:text-sm leading-relaxed">
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
              </div>

        {/* Border */}
        <div className="border-t-2 border-yellow-400 mx-4 lg:mx-8"></div>

        {/* Snake Game Section */}
        <div className="flex flex-col lg:flex-row p-4 lg:p-8">
          {/* Snake Game Board */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center space-y-6 mb-6">
              <div className="text-3xl lg:text-4xl mb-4 lg:mb-8">🐍</div>
              <h2 className="text-2xl lg:text-3xl font-bold">EXPERIENCES (SNAKE)</h2>
              
              <div className="text-sm lg:text-lg space-y-2">
                <p className="lg:hidden">Swipe or use buttons to control the snake</p>
                <p className="hidden lg:block">{experiences.length} experiences are on the board.</p>
                <span className="text-yellow-400">🎓</span> Schools
                    <span className="ml-4 text-yellow-400">💼</span> Jobs
                    <span className="ml-4 text-yellow-400">🌍</span> Places Lived
                    <span className="text-yellow-400">🚀</span> Projects
                    <span className="ml-4 text-yellow-400">📄</span> Essays
                    
              </div>
              <div className="text-sm lg:text-lg space-y-1 text-yellow-300">
                <p>Use arrows to move, eat food, and avoid obstacles</p>
                <div className="space-y-1 text-sm">
                  <div>
              </div>
                  <div>
                  </div>
                </div>
                <p>Compete against a greedy algorithm bot!</p>
              </div>
              {!gameStarted && (
              <button
                onClick={startGame}
                className="px-6 lg:px-8 py-3 lg:py-4 bg-yellow-600 text-black font-bold border-2 border-yellow-400 hover:bg-yellow-700 transition-colors text-sm lg:text-base"
              >
                PLAY GAME
              </button>
              )}
            </div>

            <div className="flex flex-col items-center space-y-4">
              {/* Score Display */}
              <div className="flex gap-8 mb-4">
                <div className="bg-yellow-800 px-4 py-2 rounded border border-yellow-600">
                  <div className="text-center">
                    <div className="text-sm text-yellow-300">👤 You</div>
                    <div className="text-lg font-bold">{score}</div>
                  </div>
                </div>
                <div className="bg-red-800 px-4 py-2 rounded border border-red-600">
                  <div className="text-center">
                    <div className="text-sm text-red-300">🤖 Bot</div>
                    <div className="text-lg font-bold">{botScore}</div>
                  </div>
                </div>
              </div>
              
              {/* Game Grid */}
              <div 
                className="border-2 border-yellow-400 bg-black"
                style={{
                  width: GRID_SIZE * CELL_SIZE,
                  height: GRID_SIZE * CELL_SIZE,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  maxWidth: '100%',
                  maxHeight: '60vh'
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Grid cells */}
                {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  
                  // Check if this is player snake
                  const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
                  const isSnakeHead = snakeIndex === 0;
                  const isSnakeBody = snakeIndex > 0;
                  
                  // Check if this is bot snake
                  const botSnakeIndex = botSnake.findIndex(segment => segment.x === x && segment.y === y);
                  const isBotSnakeHead = botSnakeIndex === 0;
                  const isBotSnakeBody = botSnakeIndex > 0;
                  
                  // Check if this is food
                  const currentFood = food.find(f => f.x === x && f.y === y);
                  
                  return (
                    <div
                      key={i}
                      className={`border border-yellow-800 ${
                        isSnakeHead ? 'bg-yellow-400' : 
                        isSnakeBody ? 'bg-yellow-600' : 
                        isBotSnakeHead ? 'bg-red-400' :
                        isBotSnakeBody ? 'bg-red-600' :
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
                      {isBotSnakeHead && <div className="text-white text-center text-sm font-bold">🤖</div>}
                      {isBotSnakeBody && <div className="text-white text-center text-sm">●</div>}
                      {currentFood && (
                        <div className="text-black text-center text-sm font-bold">
                          {getTypeIcon(currentFood.type)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile Direction Controls */}
              <div className="lg:hidden">
                <div className="text-center mb-2">
                  <p className="text-yellow-300 text-sm">Swipe or use buttons to control</p>
                </div>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {/* Up */}
                  <div></div>
                  <button
                    onClick={() => gameStarted && !gameOver && direction.y === 0 && setDirection({ x: 0, y: -1 })}
                    className="w-12 h-12 bg-yellow-600 text-black font-bold border-2 border-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center"
                  >
                    ↑
                  </button>
                  <div></div>
                  
                  {/* Left, Down, Right */}
                  <button
                    onClick={() => gameStarted && !gameOver && direction.x === 0 && setDirection({ x: -1, y: 0 })}
                    className="w-12 h-12 bg-yellow-600 text-black font-bold border-2 border-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => gameStarted && !gameOver && direction.y === 0 && setDirection({ x: 0, y: 1 })}
                    className="w-12 h-12 bg-yellow-600 text-black font-bold border-2 border-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => gameStarted && !gameOver && direction.x === 0 && setDirection({ x: 1, y: 0 })}
                    className="w-12 h-12 bg-yellow-600 text-black font-bold border-2 border-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Over Screen */}
          {gameOver && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                <div className="text-center space-y-4 bg-yellow-900 p-8 border-2 border-yellow-400 max-w-6xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-3xl font-bold">
                    {winner === 'player' ? "🎉 YOU WIN! 🎉" :
                     winner === 'bot' ? "🤖 BOT WINS! 🤖" :
                     "🤝 IT'S A TIE! 🤝"}
                </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Player Results */}
                    <div className="bg-yellow-800 p-4 rounded border border-yellow-600">
                      <h3 className="text-xl font-bold mb-3">👤 Your Score: {score}</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {collectedExperiences.map((exp, index) => (
                          <div key={index} className="bg-yellow-700 p-2 rounded text-sm">
                            <span className="font-bold">{exp.name}</span> +{exp.points}pts
                            </div>
                        ))}
                            </div>
                    </div>
                    
                    {/* Bot Results */}
                    <div className="bg-red-800 p-4 rounded border border-red-600">
                      <h3 className="text-xl font-bold mb-3">🤖 Bot Score: {botScore}</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {botCollectedExperiences.map((exp, index) => (
                          <div key={index} className="bg-red-700 p-2 rounded text-sm">
                            <span className="font-bold">{exp.name}</span> +{exp.points}pts
                          </div>
                        ))}
                    </div>
                  </div>
                  </div>
                
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

        {/* Border */}
        <div className="border-t-2 border-yellow-400 mx-4 lg:mx-8"></div>

        {/* Tetris Game Section */}
        <div className="p-4 lg:p-8">
          {/* Tetris Title and Description */}
          <div className="text-center space-y-6 mb-8">
            <div className="text-3xl lg:text-4xl mb-4 lg:mb-8">🎮</div>
            <h2 className="text-2xl lg:text-3xl font-bold">PROJECTS (TETRIS)</h2>
            <div className="text-sm lg:text-lg space-y-2">
              <p>Beat an epsilon-greedy Q-learning bot</p>
              <p>Use side arrow keys to move, up arrow to rotate, space to drop</p>
            </div>
            {!tetrisGameStarted && (
                <button
                onClick={startTetrisGame}
                className="px-6 lg:px-8 py-3 lg:py-4 bg-yellow-600 text-black font-bold border-2 border-yellow-400 hover:bg-yellow-700 transition-colors text-sm lg:text-base"
                >
                PLAY GAME
                </button>
            )}
              </div>
              
          {/* Player and Bot Boards */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center mb-8">
              {/* Player Tetris Board */}
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold text-yellow-300 mb-4">👤 YOU</h3>

              <div className="flex flex-col items-center space-y-4">
                {/* Player Score */}
                <div className="text-center">
                  <div className="text-sm text-yellow-300 space-y-1">
                    <div>Score: {tetrisScore}</div>
                    <div>Lines: {tetrisLines}</div>
                </div>
                </div>
                
                {/* Player Game Board */}
                <div className="border-2 border-yellow-400 bg-black p-2 relative">
                  <div 
                    className="grid gap-0"
                    style={{
                      gridTemplateColumns: `repeat(${TETRIS_WIDTH}, 20px)`,
                      gridTemplateRows: `repeat(${TETRIS_HEIGHT}, 20px)`
                    }}
                  >
                    {/* Render board */}
                    {tetrisBoard.map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`player-${x}-${y}`}
                          className={`w-5 h-5 border border-gray-800 ${
                            cell ? 'bg-yellow-400' : 'bg-black'
                          }`}
                        />
                      ))
                    )}
                    
                    {/* Render current piece */}
                    {currentPiece && currentPiece.shape.map((row, y) =>
                      row.map((cell, x) => {
                        if (!cell) return null;
                        const boardX = currentPiece.x + x;
                        const boardY = currentPiece.y + y;
                        if (boardY < 0) return null;
                        
                        return (
                          <div
                            key={`player-piece-${x}-${y}`}
                            className="w-5 h-5 border border-yellow-300 absolute"
                            style={{
                              backgroundColor: tetrisPieces[currentPiece.type as keyof typeof tetrisPieces].color,
                              left: `${boardX * 20 + 8}px`,
                              top: `${boardY * 20 + 8}px`
                            }}
                          />
                        );
                      })
                    )}
                    </div>
                </div>
                
                {/* Next Piece for Player */}
                <div className="text-center">
                  <h4 className="text-yellow-300 text-sm font-bold mb-2">NEXT</h4>
                  <div className="border border-yellow-400 bg-black p-2">
                    <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(4, 15px)', gridTemplateRows: 'repeat(4, 15px)' }}>
                      {nextPiece && tetrisPieces[nextPiece as keyof typeof tetrisPieces].shape.map((row, y) =>
                        row.map((cell, x) => (
                          <div
                            key={`player-next-${x}-${y}`}
                            className={`w-4 h-4 border border-gray-800 ${
                              cell ? 'bg-yellow-400' : 'bg-black'
                            }`}
                            style={{
                              backgroundColor: cell ? tetrisPieces[nextPiece as keyof typeof tetrisPieces].color : undefined
                            }}
                          />
                        ))
                      )}
                </div>
                </div>
                  <p className="text-yellow-300 text-xs mt-1">
                    {nextPiece && experiences.find(exp => exp.id === tetrisPieces[nextPiece as keyof typeof tetrisPieces].project)?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Bot Tetris Board */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold text-red-300 mb-4">🤖 BOT</h3>
              <div className="flex flex-col items-center space-y-4">
                {/* Bot Score */}
                <div className="text-center">
                  <div className="text-sm text-red-300 space-y-1">
                    <div>Score: {tetrisBotScore}</div>
                    <div>Level: {tetrisLevel}</div>
                    <div>Lines: {tetrisBotLines}</div>
                </div>
                </div>
                
                {/* Bot Game Board */}
                <div className="border-2 border-red-400 bg-black p-2 relative">
                  <div 
                    className="grid gap-0"
                    style={{
                      gridTemplateColumns: `repeat(${TETRIS_WIDTH}, 20px)`,
                      gridTemplateRows: `repeat(${TETRIS_HEIGHT}, 20px)`
                    }}
                  >
                    {/* Render bot board */}
                    {tetrisBotBoard.map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`bot-${x}-${y}`}
                          className={`w-5 h-5 border border-gray-800 ${
                            cell ? 'bg-red-400' : 'bg-black'
                          }`}
                        />
                      ))
                    )}
                    
                    {/* Render bot current piece */}
                    {tetrisBotPiece && tetrisBotPiece.shape.map((row, y) =>
                      row.map((cell, x) => {
                        if (!cell) return null;
                        const boardX = tetrisBotPiece.x + x;
                        const boardY = tetrisBotPiece.y + y;
                        if (boardY < 0) return null;
                        
                        return (
                          <div
                            key={`bot-piece-${x}-${y}`}
                            className="w-5 h-5 border border-red-300 absolute"
                            style={{
                              backgroundColor: tetrisPieces[tetrisBotPiece.type as keyof typeof tetrisPieces].color,
                              left: `${boardX * 20 + 8}px`,
                              top: `${boardY * 20 + 8}px`
                            }}
                          />
                        );
                      })
                    )}
                </div>
                </div>
                
                {/* Next Piece for Bot */}
                <div className="text-center">
                  <h4 className="text-red-300 text-sm font-bold mb-2">NEXT</h4>
                  <div className="border border-red-400 bg-black p-2">
                    <div className="grid gap-0" style={{ gridTemplateColumns: 'repeat(4, 15px)', gridTemplateRows: 'repeat(4, 15px)' }}>
                      {nextPiece && tetrisPieces[nextPiece as keyof typeof tetrisPieces].shape.map((row, y) =>
                        row.map((cell, x) => (
                          <div
                            key={`bot-next-${x}-${y}`}
                            className={`w-4 h-4 border border-gray-800 ${
                              cell ? 'bg-red-400' : 'bg-black'
                            }`}
                            style={{
                              backgroundColor: cell ? tetrisPieces[nextPiece as keyof typeof tetrisPieces].color : undefined
                            }}
                          />
                        ))
              )}
            </div>
                  </div>
                  <p className="text-red-300 text-xs mt-1">
                    {nextPiece && experiences.find(exp => exp.id === tetrisPieces[nextPiece as keyof typeof tetrisPieces].project)?.name}
                  </p>
                  </div>
                  </div>
                </div>
              </div>

          {/* Game Controls */}
          {tetrisGameStarted && (
            <div className="text-center mt-8">
              <div className="text-xs text-yellow-300 space-y-1 mb-4">
                <div>← → Move | ↑ Rotate | ↓ Soft Drop | Space Hard Drop | P Pause</div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setTetrisPaused(prev => !prev)}
                  className="px-3 py-1 bg-yellow-600 text-black text-xs font-bold border border-yellow-400 hover:bg-yellow-700 transition-colors"
                >
                  {tetrisPaused ? 'RESUME' : 'PAUSE'}
                </button>
                <button
                  onClick={resetTetrisGame}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-bold border border-red-400 hover:bg-red-700 transition-colors"
                >
                  RESET
                </button>
                </div>
              </div>
          )}
        </div>
                
        {/* Tetris Game Over */}
        {tetrisGameOver && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="text-center space-y-4 bg-yellow-900 p-8 border-2 border-yellow-400 max-w-4xl">
              <h2 className="text-2xl font-bold">
                {tetrisWinner === 'player' ? "🎉 YOU WIN! 🎉" :
                 tetrisWinner === 'bot' ? "🤖 BOT WINS! 🤖" :
                 "GAME OVER!"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Player Results */}
                <div className="bg-yellow-800 p-4 rounded border border-yellow-600">
                  <h3 className="text-xl font-bold mb-3">👤 Your Score: {tetrisScore}</h3>
                  <p className="text-yellow-300 text-sm">Lines: {tetrisLines}</p>
            </div>
            
                {/* Bot Results */}
                <div className="bg-red-800 p-4 rounded border border-red-600">
                  <h3 className="text-xl font-bold mb-3">🤖 Bot Score: {tetrisBotScore}</h3>
                  <p className="text-red-300 text-sm">Lines: {tetrisBotLines}</p>
                        </div>
              </div>
              
              <div className="mt-6 space-x-4">
                <button
                  onClick={startTetrisGame}
                  className="px-6 py-3 bg-yellow-600 text-black font-bold border border-yellow-400 hover:bg-yellow-700 transition-colors"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={resetTetrisGame}
                  className="px-6 py-3 bg-red-600 text-white font-bold border border-red-400 hover:bg-red-700 transition-colors"
                >
                  MAIN MENU
                </button>
                      </div>
                    </div>
              </div>
        )}

        {/* Border */}

        {/* Projects Section */}
        <div className="p-4 lg:p-8">
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {experiences
              .filter(exp => exp.type === 'project')
                    .sort((a, b) => b.impressiveness - a.impressiveness)
              .map((project) => (
                      <div 
                        key={project.id}
                  className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 hover:border-yellow-400 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-yellow-200 font-bold text-base">{project.name}</h3>
                    <span className="text-yellow-400 text-sm">{project.location}</span>
                          </div>
                  <p className="text-yellow-300 text-sm mb-3">{project.description}</p>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                      className="inline-block w-full text-center px-3 py-2 bg-yellow-600 text-black text-sm font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded"
                            >
                              View Project →
                            </a>
                          )}
                      </div>
                    ))}
        </div>
      </div>

        {/* Border */}
        <div className="border-t-2 border-yellow-400 mx-4 lg:mx-8"></div>

      {/* Footer */}
      <div className="p-4 text-center text-yellow-300">
        <p className="font-bold">THANK YOU</p>
        <p className="text-sm mt-1">Technology • Government • Markets</p>
      </div>
      </div>
    </div>
  );
};

export default Index;
