import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ExplorationHUD } from "@/components/ExplorationHUD";
import { useExploration } from "@/contexts/ExplorationContext";

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
  const [snakeBotScore, setSnakeBotScore] = useState(0);
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
  const { isInfinityRoomUnlocked, markSnakePlayed, markConnectFourPlayed } = useExploration();

  // Connect Four game state
  const [connectFourBoard, setConnectFourBoard] = useState<number[][]>([]);
  const [connectFourGameStarted, setConnectFourGameStarted] = useState(false);
  const [connectFourGameOver, setConnectFourGameOver] = useState(false);
  const [connectFourWinner, setConnectFourWinner] = useState<'player' | 'bot' | 'tie' | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'player' | 'bot'>('player');
  const [playerScore, setPlayerScore] = useState(0);
  const [connectFourBotScore, setConnectFourBotScore] = useState(0);
  const [lastMove, setLastMove] = useState<{row: number, col: number} | null>(null);
  const [learningRate, setLearningRate] = useState(0.1); // User-controlled learning rate
  const [connectFourPlayed, setConnectFourPlayed] = useState(false); // Track if Connect Four has been played
  const [userHasMadeFirstMove, setUserHasMadeFirstMove] = useState(false); // Track if user has made their first move

  // Connect Four bot state
  const [botBoard, setBotBoard] = useState<number[][]>([]);

  // RL bot (epsilon-greedy linear Q-learning)
  const rlWeightsRef = useRef<number[]>([
    -0.1,  // bias
    0.8,   // winning moves
    -0.6,  // blocking opponent wins
    0.4,   // creating opportunities
    -0.3,  // center control
    -0.2   // edge avoidance
  ]);
  const epsilonRef = useRef(0.15);  // exploration
  const alphaRef = useRef(0.1);     // learning rate
  const gammaRef = useRef(0.95);    // discount

  // Q-learning state tracking
  const prevStateRef = useRef<string | null>(null);
  const prevQRef = useRef<number | null>(null);
  const gameHistoryRef = useRef<Array<{state: string, action: number, reward: number}>>([]);
  const gamesPlayedRef = useRef(0);

  const GRID_SIZE = 20;
  const CELL_SIZE = 25;
  const CONNECT_FOUR_ROWS = 6;
  const CONNECT_FOUR_COLS = 7;

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
    { id: "regulations-scraper", name: "Regulations Comment Scraper", type: "project", location: "Government", description: "Public comment analysis tool", color: "#96CEB4", points: 16, impressiveness: 6, url: "https://regulations-comment-scraper.streamlit.app/" },
    { id: "treasury-tool", name: "Internal Treasury Tool", type: "project", location: "Government", description: "Contract vehicle tracking system", color: "#96CEB4", points: 20, impressiveness: 7, url: "https://home.treasury.gov/system/files/236/20241106-PCLIA-ServiceNow-508.pdf" },
    { id: "health-economics", name: "Prior Authorization Research", type: "project", location: "Research", description: "Healthcare Economics Research", color: "#96CEB4", points: 15, impressiveness: 7, url: "https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2805678" },

    // Achievements
    { id: "ai-frontier", name: "AI Frontier", type: "achievement", location: "Portfolio", description: "Interactive AI frontier visualization", color: "#FFEAA7", points: 30, impressiveness: 9},
    { id: "why", name: "Why Things Must Happen", type: "achievement", location: "Portfolio", description: "Explores what that might mean for memory, intelligence, and meaning.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    { id: "care", name: "The First Machine that Cared", type: "achievement", location: "Portfolio", description: "A case for models that care.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    { id: "hashtag", name: "The Worst Invention of the 21st Century", type: "achievement", location: "Portfolio", description: "A critique of the hashtag.", color: "#FFEAA7", points: 25, impressiveness: 7 },
    { id: "stakes", name: "The Stakes of the AI Race", type: "achievement", location: "Portfolio", description: "Reflecting on the AI race.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    { id: "intel", name: "The Endurance of Intelligence", type: "achievement", location: "Portfolio", description: "Reflections on the future of intelligence.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    { id: "adaptive-sycophancy", name: "Adaptive Sycophancy", type: "achievement", location: "Portfolio", description: "A case for adaptive guardrails.", color: "#FFEAA7", points: 25, impressiveness: 8 },
    
  ];



  // Connect Four game functions
  const initializeConnectFourBoard = useCallback(() => {
    const board = Array(CONNECT_FOUR_ROWS).fill(null).map(() => Array(CONNECT_FOUR_COLS).fill(0));
    setConnectFourBoard(board);
    setBotBoard(board);
  }, []);

  const isValidMove = useCallback((board: number[][], col: number) => {
    return board[0][col] === 0;
  }, []);

  const getNextEmptyRow = useCallback((board: number[][], col: number) => {
    for (let row = CONNECT_FOUR_ROWS - 1; row >= 0; row--) {
      if (board[row][col] === 0) {
        return row;
      }
    }
    return -1;
  }, []);

  const makeMove = useCallback((board: number[][], col: number, player: number) => {
    const newBoard = board.map(row => [...row]);
    const row = getNextEmptyRow(newBoard, col);
    if (row !== -1) {
      newBoard[row][col] = player;
      return { board: newBoard, row, col };
    }
    return null;
  }, [getNextEmptyRow]);

  const checkWin = useCallback((board: number[][], row: number, col: number, player: number) => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1]   // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      
      // Check in positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        if (newRow < 0 || newRow >= CONNECT_FOUR_ROWS || newCol < 0 || newCol >= CONNECT_FOUR_COLS) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      
      // Check in negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - dr * i;
        const newCol = col - dc * i;
        if (newRow < 0 || newRow >= CONNECT_FOUR_ROWS || newCol < 0 || newCol >= CONNECT_FOUR_COLS) break;
        if (board[newRow][newCol] !== player) break;
        count++;
      }
      
      if (count >= 4) return true;
    }
    return false;
  }, []);

  const isBoardFull = useCallback((board: number[][]) => {
    return board[0].every(cell => cell !== 0);
  }, []);

  const learnFromGame = useCallback(() => {
    // Process the game history and update weights
    const history = gameHistoryRef.current;
    if (history.length === 0) return;
    
    // Update weights for each move in the game using user-controlled learning rate
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const reward = entry.reward;
      if (reward > 0) {
        // Positive reward - increase weights based on learning rate
        rlWeightsRef.current = rlWeightsRef.current.map(w => w + learningRate);
      } else if (reward < 0) {
        // Negative reward - decrease weights based on learning rate
        rlWeightsRef.current = rlWeightsRef.current.map(w => w - learningRate);
      }
    }
    
    // Clear game history
    gameHistoryRef.current = [];
    gamesPlayedRef.current += 1;
    
    // Decay epsilon
    epsilonRef.current = Math.max(0.05, epsilonRef.current * 0.999);
    
    // Log learning progress
    console.log(`Game ${gamesPlayedRef.current} completed. Learning Rate: ${learningRate}, Epsilon: ${epsilonRef.current.toFixed(3)}`);
  }, [learningRate]);

  const handlePlayerMove = useCallback((col: number) => {
    if (currentPlayer !== 'player' || connectFourGameOver) return;
    
    if (!isValidMove(connectFourBoard, col)) return;
    
    // Mark that user has made their first move
    if (!userHasMadeFirstMove) {
      setUserHasMadeFirstMove(true);
      setConnectFourGameStarted(true);
    }
    
    const result = makeMove(connectFourBoard, col, 1);
    if (result) {
      const { board: newBoard, row, col: moveCol } = result;
      setConnectFourBoard(newBoard);
      setLastMove({ row, col: moveCol });
      
      if (checkWin(newBoard, row, moveCol, 1)) {
        setConnectFourWinner('player');
        setConnectFourGameOver(true);
        setPlayerScore(prev => prev + 1);
        setConnectFourPlayed(true);
        
        // Negative reward for bot loss
        gameHistoryRef.current.forEach(entry => {
          entry.reward = entry.reward - 10; // Negative reward for losing
        });
        
        // Learn from the game
        learnFromGame();
      } else if (isBoardFull(newBoard)) {
        setConnectFourWinner('tie');
        setConnectFourGameOver(true);
        setConnectFourPlayed(true);
        
        // Small positive reward for tie
        gameHistoryRef.current.forEach(entry => {
          entry.reward = entry.reward + 2;
        });
        
        // Learn from the game
        learnFromGame();
      } else {
        console.log('Setting current player to bot');
        setCurrentPlayer('bot');
        // Bot move will be triggered by useEffect
      }
    }
  }, [currentPlayer, connectFourBoard, connectFourGameOver, isValidMove, makeMove, checkWin, isBoardFull, learnFromGame, userHasMadeFirstMove]);

  const startConnectFourGame = () => {
    // Initialize clean boards
    const cleanBoard = Array(CONNECT_FOUR_ROWS).fill(null).map(() => Array(CONNECT_FOUR_COLS).fill(0));
    setConnectFourBoard(cleanBoard);
    setBotBoard(cleanBoard);
    
    // Reset game state
    setPlayerScore(0);
    setConnectFourBotScore(0);
    setConnectFourGameOver(false);
    setConnectFourWinner(null);
    setCurrentPlayer('player');
    setLastMove(null);
    
    // Start the game
    setConnectFourGameStarted(true);
  };

  const resetConnectFourGame = () => {
    setConnectFourGameStarted(false);
    setConnectFourGameOver(false);
    setConnectFourWinner(null);
    setCurrentPlayer('player');
    setPlayerScore(0);
    setConnectFourBotScore(0);
    setLastMove(null);
    setConnectFourBoard([]);
    setBotBoard([]);
    setUserHasMadeFirstMove(false);
  };

  // Q-learning helper functions
  const boardToString = useCallback((board: number[][]) => {
    return board.map(row => row.join('')).join('');
  }, []);

  const extractFeatures = useCallback((board: number[][], lastRow: number, lastCol: number, player: number) => {
    // Check for immediate win
    if (checkWin(board, lastRow, lastCol, player)) {
      return [1, 1, 0, 0, 0, 0]; // bias, winning move
    }
    
    // Check for opponent win (blocking)
    const opponent = player === 1 ? 2 : 1;
    let blockingMove = 0;
    for (let col = 0; col < CONNECT_FOUR_COLS; col++) {
      if (!isValidMove(board, col)) continue;
      const result = makeMove(board, col, opponent);
      if (result && checkWin(result.board, result.row, result.col, opponent)) {
        blockingMove = 1;
        break;
      }
    }
    
    // Center control
    const centerCol = Math.floor(CONNECT_FOUR_COLS / 2);
    const centerControl = lastCol === centerCol ? 1 : 0;
    
    // Edge avoidance
    const edgeAvoidance = (lastCol === 0 || lastCol === CONNECT_FOUR_COLS - 1) ? 1 : 0;
    
    // Opportunities (3 in a row)
    const opportunities = countOpportunities(board, player);
    const opportunityFeature = Math.min(opportunities / 3, 1); // Normalize to 0-1
    
    return [1, 0, blockingMove, opportunityFeature, centerControl, edgeAvoidance];
  }, [checkWin, isValidMove, makeMove]);

  const calculateQValue = useCallback((features: number[]) => {
    return features.reduce((sum, feature, i) => sum + feature * rlWeightsRef.current[i], 0);
  }, []);

  const updateWeights = useCallback((state: string, action: number, reward: number, nextState: string | null) => {
    const currentFeatures = extractFeatures(connectFourBoard, 0, 0, 2); // Placeholder, will be updated
    const currentQ = calculateQValue(currentFeatures);
    
    let targetQ = reward;
    if (nextState) {
      // Find the best Q-value for the next state
      let bestNextQ = -Infinity;
      for (let col = 0; col < CONNECT_FOUR_COLS; col++) {
        if (!isValidMove(connectFourBoard, col)) continue;
        const result = makeMove(connectFourBoard, col, 2);
        if (result) {
          const features = extractFeatures(result.board, result.row, result.col, 2);
          const qValue = calculateQValue(features);
          bestNextQ = Math.max(bestNextQ, qValue);
        }
      }
      targetQ = reward + gammaRef.current * bestNextQ;
    }
    
    const delta = targetQ - currentQ;
    
    // Update weights
    const newWeights = [...rlWeightsRef.current];
    for (let i = 0; i < newWeights.length; i++) {
      newWeights[i] += alphaRef.current * delta * currentFeatures[i];
    }
    rlWeightsRef.current = newWeights;
    
    // Decay epsilon
    epsilonRef.current = Math.max(0.05, epsilonRef.current * 0.999);
  }, [connectFourBoard, extractFeatures, calculateQValue, isValidMove, makeMove]);

  // Connect Four bot AI functions
  const calculateBotMove = useCallback((board: number[][]) => {
    // Epsilon-greedy strategy
    if (Math.random() < epsilonRef.current) {
      // Random move
      const validMoves = [];
      for (let col = 0; col < CONNECT_FOUR_COLS; col++) {
        if (isValidMove(board, col)) {
          validMoves.push(col);
        }
      }
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Q-learning based move
    let bestQ = -Infinity;
    let bestMove = 0;
    
    for (let col = 0; col < CONNECT_FOUR_COLS; col++) {
      if (!isValidMove(board, col)) continue;
      
      const result = makeMove(board, col, 2); // Bot is player 2
      if (result) {
        const { board: newBoard, row, col: moveCol } = result;
        const features = extractFeatures(newBoard, row, moveCol, 2);
        const qValue = calculateQValue(features);
        
        if (qValue > bestQ) {
          bestQ = qValue;
          bestMove = col;
        }
      }
    }
    
    return bestMove;
  }, [isValidMove, makeMove, extractFeatures, calculateQValue]);

  const evaluateBoard = useCallback((board: number[][], lastRow: number, lastCol: number, player: number) => {
    // Check for immediate win
    if (checkWin(board, lastRow, lastCol, player)) {
      return 1000;
    }
    
    // Check for opponent win (blocking)
    const opponent = player === 1 ? 2 : 1;
    for (let col = 0; col < CONNECT_FOUR_COLS; col++) {
      if (!isValidMove(board, col)) continue;
      const result = makeMove(board, col, opponent);
      if (result && checkWin(result.board, result.row, result.col, opponent)) {
        return 800; // High value for blocking
      }
    }
    
    // Evaluate board features
    let score = 0;
    
    // Center control
    const centerCol = Math.floor(CONNECT_FOUR_COLS / 2);
    if (lastCol === centerCol) score += 3;
    
    // Avoid edges
    if (lastCol === 0 || lastCol === CONNECT_FOUR_COLS - 1) score -= 1;
    
    // Create opportunities (3 in a row)
    score += countOpportunities(board, player) * 2;
    
    return score;
  }, [checkWin, isValidMove, makeMove]);

  const countOpportunities = useCallback((board: number[][], player: number) => {
    let opportunities = 0;
    
    // Check for 3 in a row with space for 4th
    for (let row = 0; row < CONNECT_FOUR_ROWS; row++) {
      for (let col = 0; col < CONNECT_FOUR_COLS; col++) {
        if (board[row][col] === player) {
          // Check horizontal opportunities
          if (col <= CONNECT_FOUR_COLS - 4) {
            let count = 1;
            let empty = 0;
            for (let i = 1; i < 4; i++) {
              if (board[row][col + i] === player) count++;
              else if (board[row][col + i] === 0) empty++;
            }
            if (count === 3 && empty === 1) opportunities++;
          }
          
          // Check vertical opportunities
          if (row <= CONNECT_FOUR_ROWS - 4) {
            let count = 1;
            let empty = 0;
            for (let i = 1; i < 4; i++) {
              if (board[row + i][col] === player) count++;
              else if (board[row + i][col] === 0) empty++;
            }
            if (count === 3 && empty === 1) opportunities++;
          }
        }
      }
    }
    
    return opportunities;
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
            const finalBotScore = snakeBotScore;
            
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
          setSnakeBotScore(prev => prev + eatenFood.points);
          setBotCollectedExperiences(prev => [...prev, eatenFood]);
          
          // Remove eaten food
          const newFood = [...food];
          newFood.splice(botFoodIndex, 1);
          setFood(newFood);
          
          // Check if all food collected
          if (newFood.length === 0) {
            // Game ends - compare scores
            const finalPlayerScore = score;
            const finalBotScore = snakeBotScore + eatenFood.points;
            
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
  }, [gameStarted, gameOver, direction, food, calculateBotDirection, gameSpeed, score, highScore, snake, botSnake, snakeBotScore, checkCollision]);

  // Connect Four bot move effect
  useEffect(() => {
    console.log('Bot useEffect triggered:', { currentPlayer, connectFourGameStarted, connectFourGameOver });
    if (currentPlayer === 'bot' && connectFourGameStarted && !connectFourGameOver) {
      console.log('Bot is thinking...');
      const timer = setTimeout(() => {
        const currentState = boardToString(connectFourBoard);
        const botMove = calculateBotMove(connectFourBoard);
        const result = makeMove(connectFourBoard, botMove, 2);
        
        if (result) {
          const { board: newBoard, row, col } = result;
          const nextState = boardToString(newBoard);
          
          // Store the move for learning
          gameHistoryRef.current.push({
            state: currentState,
            action: botMove,
            reward: 0 // Will be updated when game ends
          });
          
          setConnectFourBoard(newBoard);
          setBotBoard(newBoard);
          setLastMove({ row, col });
          
          if (checkWin(newBoard, row, col, 2)) {
            setConnectFourWinner('bot');
            setConnectFourGameOver(true);
            setConnectFourBotScore(prev => prev + 1);
            setConnectFourPlayed(true);
            
            // Update rewards for bot win
            gameHistoryRef.current.forEach(entry => {
              entry.reward = entry.reward + 10; // Positive reward for winning
            });
            
            // Learn from the game
            learnFromGame();
          } else if (isBoardFull(newBoard)) {
            setConnectFourWinner('tie');
            setConnectFourGameOver(true);
            setConnectFourPlayed(true);
            
            // Small positive reward for tie
            gameHistoryRef.current.forEach(entry => {
              entry.reward = entry.reward + 2;
            });
            
            // Learn from the game
            learnFromGame();
          } else {
            setCurrentPlayer('player');
          }
        }
      }, 500); // Bot thinks for 500ms
      
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, connectFourGameStarted, connectFourGameOver, connectFourBoard, calculateBotMove, makeMove, checkWin, isBoardFull, boardToString, learnFromGame]);



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

  // Mark Snake played when started
  useEffect(() => {
    if (gameStarted) {
      markSnakePlayed();
    }
  }, [gameStarted, markSnakePlayed]);

  // Mark Connect Four played when user makes their first move
  useEffect(() => {
    if (userHasMadeFirstMove) {
      markConnectFourPlayed();
    }
  }, [userHasMadeFirstMove, markConnectFourPlayed]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setSnakeBotScore(0);
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
    setSnakeBotScore(0);
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

  // Initialize Connect Four board on component mount
  useEffect(() => {
    if (!connectFourBoard.length) {
      const initialBoard = Array(CONNECT_FOUR_ROWS).fill(null).map(() => Array(CONNECT_FOUR_COLS).fill(0));
      setConnectFourBoard(initialBoard);
      setBotBoard(initialBoard);
      // Don't start the game automatically - wait for user interaction
    }
  }, [connectFourBoard.length]);





  return (
    <div className="min-h-screen bg-black text-yellow-400 font-mono flex flex-col">
      {/* Navigation Bar */}
      <div className="bg-yellow-900 border-b-2 border-yellow-400 p-4">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-xl font-bold">MAHIR BANSAL</h1>
          </div>
          
          {/* Mobile Navigation - Compact */}
          <div className="grid grid-cols-4 gap-2">
            <div className="px-2 py-1 bg-black text-white text-xs font-bold border border-yellow-400 rounded text-center opacity-50">
              🏠 Home
            </div>
            <a
              href="https://mahirbansal.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded text-center"
            >
              📝 Writings
            </a>
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
            
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="px-4 py-2 bg-black text-white font-bold border border-yellow-400 rounded opacity-50">
              🏠 Home
            </div>
            <a
              href="https://mahirbansal.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-yellow-600 text-white font-bold hover:bg-yellow-700 transition-colors border border-yellow-400 rounded"
            >
              📝 Writings
            </a>
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

      {/* Connect Four Game Result Alert */}
      {connectFourGameOver && connectFourWinner && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-900 border-2 border-yellow-400 text-yellow-300 px-8 py-6 rounded-lg shadow-lg z-50">
          <div className="text-center">
            <div className="text-3xl mb-4">
              {connectFourWinner === 'player' ? '🎉' : connectFourWinner === 'bot' ? '🤖' : '🤝'}
            </div>
            <div className="text-2xl font-bold mb-4">
              {connectFourWinner === 'player' ? 'YOU WIN!' : 
               connectFourWinner === 'bot' ? 'BOT WINS!' : 
               "IT'S A TIE!"}
            </div>
            <div className="text-lg space-y-2">
              <div>Player Score: {playerScore}</div>
              <div>Bot Score: {connectFourBotScore}</div>
              <div>Games Played: {gamesPlayedRef.current}</div>
            </div>
            <div className="mt-4 text-sm text-yellow-400">
              Projects are now unlocked! Scroll down to see them.
            </div>
            
            <div className="mt-6 space-x-4">
              <button
                onClick={() => {
                  setConnectFourGameOver(false);
                  setConnectFourWinner(null);
                  startConnectFourGame();
                }}
                className="px-6 py-3 bg-yellow-600 text-black font-bold border border-yellow-400 hover:bg-yellow-700 transition-colors"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={() => {
                  setConnectFourGameOver(false);
                  setConnectFourWinner(null);
                  resetConnectFourGame();
                }}
                className="px-6 py-3 bg-red-600 text-white font-bold border border-red-400 hover:bg-red-700 transition-colors"
              >
                MAIN MENU
              </button>
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
                    I'm a math and computer science student at WashU.
                    I spend most of my time thinking about where we’re headed and how we get there with what’s in our toolbox.
                  </p>
                  <p>
                    Love to chat.
                  </p>
            </div>
                </div>
              </div>
              
              {/* Exploration HUD - positioned below intro */}
              <div className="mt-6 mb-8 flex justify-center">
                <div className="w-full max-w-2xl">
                  <ExplorationHUD />
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
                    <div className="text-lg font-bold">{snakeBotScore}</div>
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
                      <h3 className="text-xl font-bold mb-3">🤖 Bot Score: {snakeBotScore}</h3>
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

        {/* Connect Four Game Section */}
        <div className="p-4 lg:p-8">
          {/* Connect Four Title and Description */}
          <div className="text-center space-y-6 mb-8">
            <div className="text-3xl lg:text-4xl mb-4 lg:mb-8">🔴🔵</div>
            <h2 className="text-2xl lg:text-3xl font-bold">PROJECTS (CONNECT FOUR)</h2>
            <div className="text-sm lg:text-lg space-y-2">
              <p>Beat an epsilon-greedy Q-learning bot</p>
              <p>Click on a column to drop your piece</p>
            </div>
              </div>
              
          {/* Game Board */}
          <div className="flex flex-col items-center mb-8">
            {/* Game Status */}
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-yellow-300 mb-2">
                {!connectFourGameOver && `Current Player: ${currentPlayer === 'player' ? '🔴 You' : '🔵 Bot'}`}
              </div>
              <div className="text-sm text-yellow-300 space-y-1">
                <div>Games Played: {gamesPlayedRef.current}</div>
              </div>
            </div>
            
            {/* Learning Rate Slider */}
            <div className="mb-4 w-full max-w-md">
              <label className="block text-yellow-300 text-sm font-bold mb-2">
                Bot Learning Rate: {learningRate.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-yellow-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(learningRate - 0.01) / 0.49 * 100}%, #374151 ${(learningRate - 0.01) / 0.49 * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-yellow-400 mt-1">
                <span>Slow (0.01)</span>
                <span>Fast (0.5)</span>
              </div>
            </div>
            
            {/* Connect Four Board */}
            <div className="border-4 border-yellow-400 bg-blue-900 p-4 rounded-lg">
              <div 
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${CONNECT_FOUR_COLS}, 50px)`,
                  gridTemplateRows: `repeat(${CONNECT_FOUR_ROWS}, 50px)`
                }}
              >
                {connectFourBoard.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${x}-${y}`}
                      className={`w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center ${
                        cell === 0 ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' :
                        cell === 1 ? 'bg-red-500' :
                        'bg-blue-500'
                      } ${lastMove && lastMove.row === y && lastMove.col === x ? 'ring-4 ring-yellow-300' : ''}`}
                      onClick={() => !connectFourGameOver && currentPlayer === 'player' && handlePlayerMove(x)}
                    >
                      {cell === 0 && currentPlayer === 'player' && !connectFourGameOver && (
                        <div className="w-8 h-8 rounded-full bg-red-400 opacity-50"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Game Controls */}
            {connectFourGameStarted && (
              <div className="mt-6 space-x-4">
                <button
                  onClick={startConnectFourGame}
                  className="px-6 py-3 bg-yellow-600 text-black font-bold border border-yellow-400 hover:bg-yellow-700 transition-colors"
                >
                  NEW GAME
                </button>
                <button
                  onClick={resetConnectFourGame}
                  className="px-6 py-3 bg-red-600 text-white font-bold border border-red-400 hover:bg-red-700 transition-colors"
                >
                  RESET
                </button>
              </div>
            )}
          </div>


        </div>

        {/* Projects Section */}
        {connectFourPlayed && (
          <div className="pt-0 p-4 lg:p-8">
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
        )}

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
