import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Each page has a different set of pixel sprites
const PAGE_SPRITES = {
  '/':        ['book', 'star', 'sparkle', 'heart', 'book'],
  '/library': ['book', 'bookmark', 'star', 'book', 'bookmark'],
  '/journal': ['pencil', 'sparkle', 'heart', 'pencil', 'star'],
  '/social':  ['heart', 'star', 'sparkle', 'heart', 'star'],
  '/challenges': ['trophy', 'star', 'sparkle', 'trophy', 'heart'],
  '/recommendations': ['sparkle', 'star', 'book', 'sparkle', 'heart'],
  '/bookstores': ['pin', 'star', 'sparkle', 'pin', 'heart'],
};

const COLORS = [
  '#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#f472b6',
  '#ec4899', '#fb7185', '#f9a8d4', '#fda4af', '#fef08a',
];

// Pixel art definitions (8x8 grids as arrays)
const SPRITE_PIXELS = {
  book: [
    '01111110',
    '01000010',
    '01011010',
    '01000010',
    '01011010',
    '01000010',
    '01111110',
    '00111100',
  ],
  star: [
    '00010000',
    '00111000',
    '11111110',
    '00111000',
    '01111100',
    '10000010',
    '00000000',
    '00000000',
  ],
  sparkle: [
    '00010000',
    '00010000',
    '11111110',
    '00010000',
    '00111000',
    '01000100',
    '00000000',
    '00000000',
  ],
  heart: [
    '01100110',
    '11111110',
    '11111110',
    '11111110',
    '01111100',
    '00111000',
    '00010000',
    '00000000',
  ],
  bookmark: [
    '01111100',
    '01000100',
    '01000100',
    '01000100',
    '01000100',
    '01101100',
    '01010100',
    '01000100',
  ],
  pencil: [
    '00001110',
    '00011100',
    '00110100',
    '01100100',
    '11000100',
    '10000110',
    '10001110',
    '01111100',
  ],
  trophy: [
    '01111100',
    '11111110',
    '11111110',
    '01111100',
    '00111000',
    '00010000',
    '00111000',
    '01111100',
  ],
  pin: [
    '00111000',
    '01111100',
    '11111110',
    '11111110',
    '01111100',
    '00111000',
    '00010000',
    '00010000',
  ],
};

function drawSprite(ctx, type, x, y, color, scale = 2) {
  const pixels = SPRITE_PIXELS[type] || SPRITE_PIXELS.star;
  ctx.fillStyle = color;
  pixels.forEach((row, ry) => {
    [...row].forEach((cell, rx) => {
      if (cell === '1') {
        ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
      }
    });
  });
}

export default function PixelSprites() {
  const canvasRef = useRef(null);
  const location = useLocation();
  const animRef = useRef(null);
  const spritesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Determine sprites for this page
    const spriteTypes = PAGE_SPRITES[location.pathname] || PAGE_SPRITES['/'];

    // Spawn floating sprites
    spritesRef.current = spriteTypes.map((type, i) => ({
      type,
      x: Math.random() * (window.innerWidth - 80) + 20,
      y: Math.random() * (window.innerHeight - 80) + 20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: COLORS[(i * 3 + Math.floor(Math.random() * COLORS.length)) % COLORS.length],
      scale: Math.random() > 0.5 ? 2 : 3,
      opacity: 0.12 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    }));

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      spritesRef.current.forEach((s) => {
        // Gentle float
        s.x += s.vx * s.speed;
        s.y += s.vy * s.speed + Math.sin(frame * 0.01 + s.phase) * 0.15;

        // Bounce off edges
        if (s.x < 0 || s.x > canvas.width - s.scale * 8) s.vx *= -1;
        if (s.y < 0 || s.y > canvas.height - s.scale * 8) s.vy *= -1;

        // Pulsing opacity
        const pulse = s.opacity + Math.sin(frame * 0.03 + s.phase) * 0.05;
        ctx.globalAlpha = Math.max(0, Math.min(1, pulse));
        drawSprite(ctx, s.type, Math.round(s.x), Math.round(s.y), s.color, s.scale);
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [location.pathname]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}