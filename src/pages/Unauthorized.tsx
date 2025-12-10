import { useEffect, useRef, useState } from 'react';
import '../styles/unauthorized.css';

const Unauthorized = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const pixelSize = 8; // Larger pixels for more visible decay
  const gridRef = useRef<boolean[][]>([]);
  const phonePixelsRef = useRef<Set<string>>(new Set());

  // Define phone number pixels (571-751-0100)
  const definePhoneNumber = (cols: number, rows: number) => {
    const phoneSet = new Set<string>();
    const centerX = Math.floor(cols / 2);
    const centerY = Math.floor(rows / 2);

    // Simple 5x7 bitmap font for digits
    const digits: { [key: string]: number[][] } = {
      '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
      '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
      '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
      '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
      '-': [[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]]
    };

    const phoneStr = '571-751-0100';
    let offsetX = centerX - (phoneStr.length * 6) / 2;
    const offsetY = centerY - 3;

    for (let i = 0; i < phoneStr.length; i++) {
      const char = phoneStr[i];
      const pattern = digits[char];

      if (pattern) {
        for (let y = 0; y < pattern.length; y++) {
          for (let x = 0; x < pattern[y].length; x++) {
            if (pattern[y][x] === 1) {
              const px = Math.floor(offsetX + x);
              const py = Math.floor(offsetY + y);
              phoneSet.add(`${px},${py}`);
            }
          }
        }
      }
      offsetX += 6;
    }

    return phoneSet;
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / pixelSize);
    const rows = Math.floor(canvas.height / pixelSize);

    // Initialize grid (all white)
    gridRef.current = Array(rows).fill(null).map(() => Array(cols).fill(true));

    // Define phone number pixels
    phonePixelsRef.current = definePhoneNumber(cols, rows);

    // Draw initial white canvas with one black pixel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw one black pixel in the center
    const blackPixelX = Math.floor(cols / 2);
    const blackPixelY = Math.floor(rows / 2) - 10;
    ctx.fillStyle = '#000000';
    ctx.fillRect(blackPixelX * pixelSize, blackPixelY * pixelSize, pixelSize, pixelSize);
    gridRef.current[blackPixelY][blackPixelX] = false;
  };

  useEffect(() => {
    initCanvas();

    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    const cols = Math.floor(canvas.width / pixelSize);
    const rows = Math.floor(canvas.height / pixelSize);

    // First click on the black pixel - open Substack
    if (!hasStarted && !gridRef.current[y]?.[x]) {
      window.open('https://mahirbansal.substack.com', '_blank');
      setHasStarted(true);
      return;
    }

    if (!hasStarted) return;

    // Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...
    const getFibonacci = (n: number): number => {
      if (n <= 1) return 1;
      let a = 1, b = 1;
      for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
      }
      return b;
    };

    const pixelsToRemove = getFibonacci(clickCount);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get all white pixels that are NOT part of the phone number
    const availablePixels: [number, number][] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (gridRef.current[row][col] && !phonePixelsRef.current.has(`${col},${row}`)) {
          availablePixels.push([col, row]);
        }
      }
    }

    // Randomly select pixels to turn black
    const shuffled = availablePixels.sort(() => Math.random() - 0.5);
    const toRemove = shuffled.slice(0, Math.min(pixelsToRemove, shuffled.length));

    // Animate pixels turning black with staggered delay
    ctx.fillStyle = '#000000';
    toRemove.forEach(([col, row], index) => {
      setTimeout(() => {
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
        gridRef.current[row][col] = false;
      }, index * 5); // 5ms delay between each pixel for visible cascade effect
    });

    setClickCount(clickCount + 1);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        display: 'block',
        cursor: 'pointer',
        margin: 0,
        padding: 0
      }}
    />
  );
};

export default Unauthorized;
