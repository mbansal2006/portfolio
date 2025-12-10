import { useEffect, useRef, useState } from 'react';
import '../styles/unauthorized.css';

const Unauthorized = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const pixelSize = 8; // Larger pixels for more visible decay
  const gridRef = useRef<string[][]>([]); // Store colors: 'black', 'red', 'blue', 'green'
  const phonePixelsRef = useRef<Set<string>>(new Set());

  const getRandomColor = () => {
    const colors = ['#ff0000', '#0000ff', '#00ff00']; // red, blue, green
    return colors[Math.floor(Math.random() * colors.length)];
  };

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

    // Calculate spacing based on screen width - tighter spacing on mobile
    const charWidth = 5; // Width of each character
    const baseSpacing = 1; // Base spacing between characters
    const totalWidth = phoneStr.length * (charWidth + baseSpacing);

    // Adjust spacing if phone number doesn't fit
    let spacing = baseSpacing;
    if (totalWidth > cols - 4) {
      // Reduce spacing for narrow screens
      spacing = Math.max(0, Math.floor((cols - 4 - phoneStr.length * charWidth) / phoneStr.length));
    }

    // Calculate starting position to ensure the entire number is visible
    const actualTotalWidth = phoneStr.length * charWidth + (phoneStr.length - 1) * spacing;
    let offsetX = Math.max(2, centerX - Math.floor(actualTotalWidth / 2));
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
              // Only add pixel if it's within bounds
              if (px >= 0 && px < cols && py >= 0 && py < rows) {
                phoneSet.add(`${px},${py}`);
              }
            }
          }
        }
      }
      offsetX += charWidth + spacing;
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

    // Initialize grid (all black)
    gridRef.current = Array(rows).fill(null).map(() => Array(cols).fill('black'));

    // Define phone number pixels
    phonePixelsRef.current = definePhoneNumber(cols, rows);

    // Draw initial black canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw one random colored pixel in the center
    const coloredPixelX = Math.floor(cols / 2);
    const coloredPixelY = Math.floor(rows / 2) - 10;
    const initialColor = getRandomColor();
    ctx.fillStyle = initialColor;
    ctx.fillRect(coloredPixelX * pixelSize, coloredPixelY * pixelSize, pixelSize, pixelSize);
    gridRef.current[coloredPixelY][coloredPixelX] = initialColor;
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

    // First click on the colored pixel - open Substack
    if (!hasStarted && gridRef.current[y]?.[x] !== 'black') {
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

    // Get all black pixels that are NOT part of the phone number
    const availablePixels: [number, number][] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (gridRef.current[row][col] === 'black' && !phonePixelsRef.current.has(`${col},${row}`)) {
          availablePixels.push([col, row]);
        }
      }
    }

    // Randomly select pixels to turn colored
    const shuffled = availablePixels.sort(() => Math.random() - 0.5);
    const toRemove = shuffled.slice(0, Math.min(pixelsToRemove, shuffled.length));

    // Animate pixels turning colored with staggered delay
    toRemove.forEach(([col, row], index) => {
      setTimeout(() => {
        const color = getRandomColor();
        ctx.fillStyle = color;
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
        gridRef.current[row][col] = color;
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
