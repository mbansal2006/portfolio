import { useEffect, useRef, useState } from 'react';
import PoemsWall from '../components/PoemsWall';
import '../styles/unauthorized.css';

const photoModules = import.meta.glob('../assets/photos/*.jpeg', {
  eager: true,
  import: 'default',
}) as Record<string, string>;
const PHOTO_URLS = Object.values(photoModules);

const Unauthorized = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [phase, setPhase] = useState<'reveal' | 'clear' | 'origin' | 'bounce' | 'poems'>('reveal');
  const pixelSize = 8;
  const REVEAL_BASE = 0.01;
  const REVEAL_GROWTH = 2;
  const CLEAR_FRACTION = 0.2;
  const MAX_STAGGER_MS = 400;
  const PHOTO_MAX_DIM = 110;
  const revealClicksRef = useRef(0);
  const gridRef = useRef<string[][]>([]); // Store colors: 'black', 'red', 'blue', 'green'
  const phonePixelsRef = useRef<Set<string>>(new Set());
  type Photo = {
    bitmap: HTMLCanvasElement;
    img: HTMLImageElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
  };
  const photosRef = useRef<Photo[]>([]);
  const [maximizedPhoto, setMaximizedPhoto] = useState<Photo | null>(null);
  const lastBouncerClickRef = useRef<{ photo: Photo; time: number } | null>(null);
  const DOUBLE_CLICK_MS = 280;
  const allSpawnedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const mockElRef = useRef<HTMLDivElement>(null);
  const mockPosRef = useRef({ x: 0, y: 0 });
  const realMouseRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  });
  const [mockMode, setMockMode] = useState<
    'hidden' | 'guiding-pixel' | 'returning'
  >('hidden');

  const getRandomColor = () => {
    const colors = ['#ff0000', '#0000ff', '#00ff00']; // red, blue, green
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const NAV_COLORS = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
  } as const;

  const NAV_TARGETS = {
    red: 'blog' as const,
    green: 'poems' as const,
    blue: 'bounce' as const,
  };

  // Set at the moment reveal → clear transitions. Each is a cell coord that survives the clear-out.
  const navPositionsRef = useRef<{
    red: [number, number];
    green: [number, number];
    blue: [number, number];
  } | null>(null);
  const navFlashRef = useRef<{ kind: 'red' | 'green' | 'blue'; at: number } | null>(null);

  const pickNavPositions = (rows: number, cols: number) => {
    const buckets: Record<'red' | 'green' | 'blue', Array<[number, number]>> = {
      red: [],
      green: [],
      blue: [],
    };
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const c = gridRef.current[row][col];
        if (c === '#ff0000') buckets.red.push([col, row]);
        else if (c === '#00ff00') buckets.green.push([col, row]);
        else if (c === '#0000ff') buckets.blue.push([col, row]);
      }
    }
    const pick = (arr: Array<[number, number]>): [number, number] | null =>
      arr.length === 0 ? null : arr[Math.floor(Math.random() * arr.length)];
    const r = pick(buckets.red);
    const g = pick(buckets.green);
    const b = pick(buckets.blue);
    if (!r || !g || !b) return; // can't form nav set; leave previous value
    navPositionsRef.current = { red: r, green: g, blue: b };
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

  // Bouncing photo collage - photos spawn in fibonacci batches and drift slowly forever
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

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    photosRef.current = [];
    allSpawnedRef.current = false;

    const loadImage = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

    // Pre-render the image into an offscreen canvas at its display size.
    // Multi-step downscale preserves detail when source is much larger than target.
    const downsampleToBitmap = (img: HTMLImageElement, targetW: number, targetH: number) => {
      const dpr = window.devicePixelRatio || 1;
      const finalW = Math.max(1, Math.round(targetW * dpr));
      const finalH = Math.max(1, Math.round(targetH * dpr));

      let srcW = img.naturalWidth;
      let srcH = img.naturalHeight;
      let current: HTMLCanvasElement | HTMLImageElement = img;

      // Halve until within 2x of final size, then do the final draw
      while (srcW > finalW * 2 && srcH > finalH * 2) {
        const nextW = Math.max(finalW, Math.floor(srcW / 2));
        const nextH = Math.max(finalH, Math.floor(srcH / 2));
        const step = document.createElement('canvas');
        step.width = nextW;
        step.height = nextH;
        const sctx = step.getContext('2d')!;
        sctx.imageSmoothingEnabled = true;
        sctx.imageSmoothingQuality = 'high';
        sctx.drawImage(current, 0, 0, nextW, nextH);
        current = step;
        srcW = nextW;
        srcH = nextH;
      }

      const out = document.createElement('canvas');
      out.width = finalW;
      out.height = finalH;
      const octx = out.getContext('2d')!;
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';
      octx.drawImage(current, 0, 0, finalW, finalH);
      return out;
    };

    const makePhoto = (img: HTMLImageElement) => {
      const aspect = img.naturalWidth / img.naturalHeight;
      const width = aspect >= 1 ? PHOTO_MAX_DIM : PHOTO_MAX_DIM * aspect;
      const height = aspect >= 1 ? PHOTO_MAX_DIM / aspect : PHOTO_MAX_DIM;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.35 + Math.random() * 0.35;
      return {
        bitmap: downsampleToBitmap(img, width, height),
        img,
        x: Math.random() * Math.max(1, canvas.width - width),
        y: Math.random() * Math.max(1, canvas.height - height),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width,
        height,
      };
    };

    Promise.all(PHOTO_URLS.map(loadImage)).then((images) => {
      if (cancelled) return;

      // Shuffle so spawn order feels random
      const shuffled = [...images].sort(() => Math.random() - 0.5);

      // Build fibonacci batch sizes until we cover all photos
      const batches: number[] = [];
      let a = 1;
      let b = 1;
      let remaining = shuffled.length;
      while (remaining > 0) {
        const take = Math.min(a, remaining);
        batches.push(take);
        remaining -= take;
        [a, b] = [b, a + b];
      }

      const BATCH_DELAY_MS = 900;
      let cursor = 0;
      batches.forEach((count, i) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          for (let k = 0; k < count; k++) {
            photosRef.current.push(makePhoto(shuffled[cursor + k]));
          }
          cursor += count;
          if (i === batches.length - 1) {
            allSpawnedRef.current = true;
          }
        }, i * BATCH_DELAY_MS);
        timeouts.push(t);
      });

      const animate = () => {
        if (!canvas || !ctx) return;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (const photo of photosRef.current) {
          photo.x += photo.vx;
          photo.y += photo.vy;

          if (photo.x <= 0 || photo.x + photo.width >= canvas.width) {
            photo.vx *= -1;
            photo.x = Math.max(0, Math.min(photo.x, canvas.width - photo.width));
          }
          if (photo.y <= 0 || photo.y + photo.height >= canvas.height) {
            photo.vy *= -1;
            photo.y = Math.max(0, Math.min(photo.y, canvas.height - photo.height));
          }

          ctx.drawImage(
            photo.bitmap,
            Math.round(photo.x),
            Math.round(photo.y),
            photo.width,
            photo.height,
          );
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();
    });

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
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

  // Origin phase: three pulsing R/G/B nav pixels with occasional sparks
  useEffect(() => {
    if (phase !== 'origin') {
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

    const start = performance.now();

    const animate = () => {
      const now = performance.now();
      const t = (now - start) / 1000;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const positions = navPositionsRef.current;
      if (positions) {
        const kinds: Array<'red' | 'green' | 'blue'> = ['red', 'green', 'blue'];
        kinds.forEach((kind, i) => {
          const [cx, cy] = positions[kind];
          const offset = (i * 2 * Math.PI) / 3;
          let pulse = 0.7 + 0.3 * Math.sin(t * 1.8 + offset);
          const flash = navFlashRef.current;
          if (flash && flash.kind === kind) {
            const since = now - flash.at;
            if (since < 450) {
              pulse = Math.min(1, pulse + (1 - since / 450) * 0.6);
            } else {
              navFlashRef.current = null;
            }
          }
          ctx.globalAlpha = pulse;
          ctx.fillStyle = NAV_COLORS[kind];
          ctx.fillRect(cx * pixelSize, cy * pixelSize, pixelSize, pixelSize);
          ctx.globalAlpha = 1;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase]);

  // Track real mouse position
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      realMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Clear bounce-only state when leaving the bounce phase
  useEffect(() => {
    if (phase !== 'bounce') {
      setMaximizedPhoto(null);
      lastBouncerClickRef.current = null;
    }
  }, [phase]);

  // First hint: point to the starting colored pixel
  useEffect(() => {
    const t = setTimeout(() => {
      mockPosRef.current = { ...realMouseRef.current };
      setMockMode('guiding-pixel');
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Drive mock cursor position — ease toward target, retire when returning-to-mouse completes
  useEffect(() => {
    if (mockMode === 'hidden') return;
    let raf = 0;
    const step = () => {
      let tx: number;
      let ty: number;
      if (mockMode === 'guiding-pixel') {
        const cols = Math.floor(window.innerWidth / pixelSize);
        const rows = Math.floor(window.innerHeight / pixelSize);
        tx = Math.floor(cols / 2) * pixelSize + pixelSize / 2;
        ty = (Math.floor(rows / 2) - 10) * pixelSize + pixelSize / 2;
      } else {
        tx = realMouseRef.current.x;
        ty = realMouseRef.current.y;
      }
      const dx = tx - mockPosRef.current.x;
      const dy = ty - mockPosRef.current.y;
      mockPosRef.current.x += dx * 0.08;
      mockPosRef.current.y += dy * 0.08;
      if (mockElRef.current) {
        mockElRef.current.style.transform = `translate(${mockPosRef.current.x}px, ${mockPosRef.current.y}px)`;
      }
      if (mockMode === 'returning' && Math.hypot(dx, dy) < 6) {
        setMockMode('hidden');
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mockMode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    const cols = Math.floor(canvas.width / pixelSize);
    const rows = Math.floor(canvas.height / pixelSize);

    // First click on the colored pixel - starts the reveal puzzle (no longer opens a tab)
    if (!hasStarted && gridRef.current[y]?.[x] !== 'black') {
      setHasStarted(true);
      return;
    }

    if (!hasStarted) return;

    if (phase === 'origin') {
      const positions = navPositionsRef.current;
      if (!positions) return;
      const kinds: Array<'red' | 'green' | 'blue'> = ['red', 'green', 'blue'];
      for (const kind of kinds) {
        const [px, py] = positions[kind];
        if (Math.abs(x - px) <= 2 && Math.abs(y - py) <= 2) {
          navFlashRef.current = { kind, at: performance.now() };
          const target = NAV_TARGETS[kind];
          if (target === 'blog') {
            const a = document.createElement('a');
            a.href = 'https://mahirbansal.substack.com';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.dispatchEvent(
              new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                ctrlKey: true,
                metaKey: true,
              }),
            );
            a.remove();
          } else if (target === 'poems') {
            setPhase('poems');
          } else if (target === 'bounce') {
            setPhase('bounce');
          }
          return;
        }
      }
      return;
    }

    if (phase === 'bounce') {
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      let hit: Photo | null = null;
      for (let i = photosRef.current.length - 1; i >= 0; i--) {
        const p = photosRef.current[i];
        if (px >= p.x && px <= p.x + p.width && py >= p.y && py <= p.y + p.height) {
          hit = p;
          break;
        }
      }
      if (!hit) return;

      const now = performance.now();
      const last = lastBouncerClickRef.current;
      if (last && last.photo === hit && now - last.time < DOUBLE_CLICK_MS) {
        // Second click in a double-click window — maximize instead of remove
        setMaximizedPhoto(hit);
        lastBouncerClickRef.current = null;
        return;
      }
      lastBouncerClickRef.current = { photo: hit, time: now };
      const target = hit;
      setTimeout(() => {
        const cur = lastBouncerClickRef.current;
        if (!cur || cur.photo !== target || cur.time !== now) return;
        lastBouncerClickRef.current = null;
        const idx = photosRef.current.indexOf(target);
        if (idx === -1) return;
        photosRef.current.splice(idx, 1);
        if (allSpawnedRef.current && photosRef.current.length === 0) {
          setPhase('origin');
        }
      }, DOUBLE_CLICK_MS);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (phase === 'reveal') {
      const availablePixels: [number, number][] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (gridRef.current[row][col] === 'black' && !phonePixelsRef.current.has(`${col},${row}`)) {
            availablePixels.push([col, row]);
          }
        }
      }

      if (availablePixels.length === 0) {
        pickNavPositions(rows, cols);
        setPhase('clear');
        return;
      }

      const fraction = Math.min(1, REVEAL_BASE * Math.pow(REVEAL_GROWTH, revealClicksRef.current));
      const pixelsToChange = Math.max(1, Math.ceil(availablePixels.length * fraction));
      const shuffled = availablePixels.sort(() => Math.random() - 0.5);
      const toColor = shuffled.slice(0, pixelsToChange);
      const perPixelMs = MAX_STAGGER_MS / toColor.length;

      toColor.forEach(([col, row], index) => {
        const paint = () => {
          const color = getRandomColor();
          ctx.fillStyle = color;
          ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
          gridRef.current[row][col] = color;
        };
        if (perPixelMs < 1) paint();
        else setTimeout(paint, index * perPixelMs);
      });

      revealClicksRef.current += 1;
      if (mockMode === 'guiding-pixel' && revealClicksRef.current >= 1) {
        setMockMode('returning');
      }

    } else if (phase === 'clear') {
      const coloredPixels: [number, number][] = [];
      const navPositions = navPositionsRef.current;
      const navSet = new Set<string>();
      if (navPositions) {
        navSet.add(`${navPositions.red[0]},${navPositions.red[1]}`);
        navSet.add(`${navPositions.green[0]},${navPositions.green[1]}`);
        navSet.add(`${navPositions.blue[0]},${navPositions.blue[1]}`);
      }
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (gridRef.current[row][col] !== 'black' && !navSet.has(`${col},${row}`)) {
            coloredPixels.push([col, row]);
          }
        }
      }

      if (coloredPixels.length === 0) {
        setPhase('origin');
        return;
      }

      const pixelsToChange = Math.max(1, Math.ceil(coloredPixels.length * CLEAR_FRACTION));
      const shuffled = coloredPixels.sort(() => Math.random() - 0.5);
      const toClear = shuffled.slice(0, pixelsToChange);
      const perPixelMs = MAX_STAGGER_MS / toClear.length;

      toClear.forEach(([col, row], index) => {
        const paint = () => {
          ctx.fillStyle = '#000000';
          ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
          gridRef.current[row][col] = 'black';
        };
        if (perPixelMs < 1) paint();
        else setTimeout(paint, index * perPixelMs);
      });
    }
  };

  return (
    <>
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
      {phase === 'poems' && (
        <PoemsWall onClose={() => setPhase('origin')} />
      )}
      {phase === 'bounce' && (
        <button
          type="button"
          aria-label="Back"
          onClick={() => setPhase('origin')}
          style={cornerCloseStyle}
        >
          <CloseIcon />
        </button>
      )}
      {phase === 'bounce' && maximizedPhoto && (
        <div
          onClick={() => setMaximizedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.25)',
            cursor: 'zoom-out',
            zIndex: 20,
          }}
        >
          <img
            src={maximizedPhoto.img.src}
            alt=""
            draggable={false}
            style={{
              maxWidth: '78vw',
              maxHeight: '78vh',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              userSelect: 'none',
            }}
          />
        </div>
      )}
      <div
        ref={mockElRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          opacity: mockMode === 'hidden' ? 0 : 1,
          transition: 'opacity 200ms ease',
          zIndex: 10,
          willChange: 'transform',
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
        >
          <path
            d="M2 2 L2 17 L6.5 13 L9 19 L12 17.7 L9.5 11.7 L15.5 11.5 Z"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};

const cornerCloseStyle: React.CSSProperties = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(4px)',
  zIndex: 25,
};

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default Unauthorized;
