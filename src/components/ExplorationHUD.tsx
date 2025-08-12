import React from 'react';
import { Eye, Lock, Unlock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useExploration } from '@/contexts/ExplorationContext';

export const ExplorationHUD: React.FC = () => {
  const { progressPercentage, isInfinityRoomUnlocked, playedSnake, playedConnectFour } = useExploration();

  const playedGames = (playedSnake ? 1 : 0) + (playedConnectFour ? 1 : 0);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-black/80 backdrop-blur-sm border border-yellow-400/50 rounded-lg p-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-mono text-yellow-400">Exploration</span>
              </div>
              <div className="flex items-center gap-1">
                {isInfinityRoomUnlocked ? (
                  <Unlock className="w-4 h-4 text-green-400" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="mb-2">
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-gray-800"
                style={{
                  '--progress-background': 'rgb(34 197 94)',
                  '--progress-foreground': 'rgb(34 197 94)',
                } as React.CSSProperties}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-300">
              <span>{progressPercentage}%</span>
              <span>{playedGames}/2 games</span>
            </div>
            
            {isInfinityRoomUnlocked && (
              <div className="mt-2 text-xs text-green-400 font-mono text-center">
                🎉 Infinity Room Unlocked!
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">Site Exploration Progress</p>
            <p className="text-sm">
              Play both games to unlock the secret Infinity Room. 
              Your progress in playing the games counts toward unlocking.
            </p>
            {isInfinityRoomUnlocked && (
              <p className="text-sm text-green-400">
                🎉 You've unlocked the Infinity Room! Visit /infinity to explore.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
