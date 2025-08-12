import { useEffect, useRef } from 'react';

interface UseRAFOptions {
  onFrame: (deltaTime: number, timestamp: number) => void;
  enabled?: boolean;
}

export function useRAF({ onFrame, enabled = true }: UseRAFOptions) {
  const rafIdRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const onFrameRef = useRef(onFrame);
  
  // Update the callback ref when onFrame changes
  onFrameRef.current = onFrame;
  
  useEffect(() => {
    if (!enabled) return;
    
    const animate = (timestamp: number) => {
      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 0;
      lastTimeRef.current = timestamp;
      
      // Convert to seconds and cap at reasonable values
      const deltaTimeSeconds = Math.min(deltaTime / 1000, 1/30); // Cap at 30fps equivalent
      
      onFrameRef.current(deltaTimeSeconds, timestamp);
      
      rafIdRef.current = requestAnimationFrame(animate);
    };
    
    rafIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled]);
  
  return {
    stop: () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = undefined;
      }
    }
  };
}
