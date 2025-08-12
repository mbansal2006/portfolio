import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ExplorationContextType {
  playedSnake: boolean;
  playedConnectFour: boolean;
  progressPercentage: number;
  markSnakePlayed: () => void;
  markConnectFourPlayed: () => void;
  isInfinityRoomUnlocked: boolean;
}

const ExplorationContext = createContext<ExplorationContextType | undefined>(undefined);

export const useExploration = () => {
  const context = useContext(ExplorationContext);
  if (context === undefined) {
    throw new Error('useExploration must be used within an ExplorationProvider');
  }
  return context;
};

interface ExplorationProviderProps {
  children: ReactNode;
}

export const ExplorationProvider: React.FC<ExplorationProviderProps> = ({ children }) => {
  const [playedSnake, setPlayedSnake] = useState(false);
  const [playedConnectFour, setPlayedConnectFour] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('exploration-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlayedSnake(parsed.playedSnake || false);
        setPlayedConnectFour(parsed.playedConnectFour || false);
      } catch (error) {
        console.error('Failed to load exploration progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('exploration-progress', JSON.stringify({
      playedSnake,
      playedConnectFour,
    }));
  }, [playedSnake, playedConnectFour]);

  const progressPercentage = Math.round(((playedSnake ? 1 : 0) + (playedConnectFour ? 1 : 0)) / 2 * 100);
  const isInfinityRoomUnlocked = playedSnake && playedConnectFour;

  const markSnakePlayed = () => setPlayedSnake(true);
  const markConnectFourPlayed = () => setPlayedConnectFour(true);

  const value: ExplorationContextType = {
    playedSnake,
    playedConnectFour,
    progressPercentage,
    markSnakePlayed,
    markConnectFourPlayed,
    isInfinityRoomUnlocked,
  };

  return (
    <ExplorationContext.Provider value={value}>
      {children}
    </ExplorationContext.Provider>
  );
};
