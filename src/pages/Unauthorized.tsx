import { useEffect, useRef, useState } from 'react';
import '../styles/unauthorized.css';

const Unauthorized = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<'reveal' | 'clear' | 'bounce'>('reveal'); // Track which phase we're in
  const pixelSize = 8; // Larger pixels for more visible decay
  const gridRef = useRef<string[][]>([]); // Store colors: 'black', 'red', 'blue', 'green'
  const phonePixelsRef = useRef<Set<string>>(new Set());
  const bounceRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  // Bouncing "da fuq" animation
  useEffect(() => {
    if (phase !== 'bounce') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize bounce position and velocity
    if (!bounceRef.current) {
      const textWidth = 120;
      const textHeight = 40;
      bounceRef.current = {
        x: Math.random() * (canvas.width - textWidth),
        y: Math.random() * (canvas.height - textHeight),
        vx: 2 + Math.random() * 2, // Random speed between 2-4
        vy: 2 + Math.random() * 2,
        width: textWidth,
        height: textHeight
      };
    }

    const animate = () => {
      if (!canvas || !ctx || !bounceRef.current) return;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bounce = bounceRef.current;

      // Update position
      bounce.x += bounce.vx;
      bounce.y += bounce.vy;

      // Bounce off edges
      if (bounce.x <= 0 || bounce.x + bounce.width >= canvas.width) {
        bounce.vx *= -1;
        bounce.x = Math.max(0, Math.min(bounce.x, canvas.width - bounce.width));
      }
      if (bounce.y <= 0 || bounce.y + bounce.height >= canvas.height) {
        bounce.vy *= -1;
        bounce.y = Math.max(0, Math.min(bounce.y, canvas.height - bounce.height));
      }

      // Draw "da fuq" text
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('da fuq', bounce.x, bounce.y + 30);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase]);

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

    const pixelsToChange = getFibonacci(clickCount);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (phase === 'reveal') {
      // REVEAL PHASE: Turn black pixels (except phone number) to color
      const availablePixels: [number, number][] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (gridRef.current[row][col] === 'black' && !phonePixelsRef.current.has(`${col},${row}`)) {
            availablePixels.push([col, row]);
          }
        }
      }

      if (availablePixels.length === 0) {
        // All non-phone pixels are colored, switch to clear phase
        setPhase('clear');
        setClickCount(0);
        return;
      }

      // Randomly select pixels to turn colored
      const shuffled = availablePixels.sort(() => Math.random() - 0.5);
      const toColor = shuffled.slice(0, Math.min(pixelsToChange, shuffled.length));

      // Animate pixels turning colored with staggered delay
      toColor.forEach(([col, row], index) => {
        setTimeout(() => {
          const color = getRandomColor();
          ctx.fillStyle = color;
          ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
          gridRef.current[row][col] = color;
        }, index * 5);
      });

      setClickCount(clickCount + 1);

    } else if (phase === 'clear') {
      // CLEAR PHASE: Turn colored pixels back to black
      const coloredPixels: [number, number][] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (gridRef.current[row][col] !== 'black') {
            coloredPixels.push([col, row]);
          }
        }
      }

      if (coloredPixels.length === 0) {
        // All pixels are black, switch to bounce phase
        setPhase('bounce');
        return;
      }

      // Randomly select pixels to turn black
      const shuffled = coloredPixels.sort(() => Math.random() - 0.5);
      const toClear = shuffled.slice(0, Math.min(pixelsToChange, shuffled.length));

      // Animate pixels turning black with staggered delay
      toClear.forEach(([col, row], index) => {
        setTimeout(() => {
          ctx.fillStyle = '#000000';
          ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
          gridRef.current[row][col] = 'black';
        }, index * 5);
      });

      setClickCount(clickCount + 1);
    }
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
