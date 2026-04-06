import { useMemo } from 'react';

const PHOTOS = [
  '/photos/2d034de4-5dc3-42b2-9388-c89990835231.jpg',
  '/photos/9ae24690-70ac-44a6-a59a-98f24762a2f2.jpg',
  '/photos/FullSizeRender.jpeg',
  '/photos/IMG_0483.jpeg',
  '/photos/IMG_0564.jpeg',
  '/photos/IMG_0969.jpeg',
  '/photos/IMG_0998.jpeg',
  '/photos/IMG_1010.jpeg',
  '/photos/IMG_5177.jpeg',
  '/photos/IMG_5718.JPG',
  '/photos/IMG_5729.JPG',
  '/photos/IMG_5730.JPG',
  '/photos/IMG_6323.jpeg',
  '/photos/IMG_8706.jpeg',
  '/photos/IMG_9223.jpeg',
  '/photos/IMG_9906.JPG',
  '/photos/a1dd9f3f-3a0a-4341-9c4b-c04dc5004616-2.jpg',
  '/photos/fa3bbf9c-c057-4dbd-a7f9-43670b6bbde3.jpg',
];

interface FloatingPhotosProps {
  count?: number;
  seed?: number;
}

const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Fixed zones along left/right edges to prevent overlap.
// Each zone is { side, topPct }. Photos placed at hard-coded slots,
// scattered top-to-bottom but never on the central content area.
const ZONES: Array<{ side: 'left' | 'right'; topPct: number }> = [
  { side: 'left',  topPct: 2 },
  { side: 'right', topPct: 5 },
  { side: 'left',  topPct: 22 },
  { side: 'right', topPct: 28 },
  { side: 'left',  topPct: 46 },
  { side: 'right', topPct: 52 },
  { side: 'left',  topPct: 70 },
  { side: 'right', topPct: 76 },
  { side: 'left',  topPct: 88 },
  { side: 'right', topPct: 92 },
];

const FloatingPhotos = ({ count = 6, seed = 42 }: FloatingPhotosProps) => {
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const shuffledPhotos = [...PHOTOS].sort(() => rand() - 0.5);
    const zones = ZONES.slice(0, Math.min(count, ZONES.length));

    return zones.map((zone, i) => {
      const src = shuffledPhotos[i % shuffledPhotos.length];
      const rotate = (rand() * 18 - 9).toFixed(1);
      const size = 120 + Math.floor(rand() * 50); // 120-170px
      const delay = (rand() * 4).toFixed(2);
      const duration = (7 + rand() * 4).toFixed(2);
      // Slight vertical jitter so they're not all in straight rows
      const topJitter = (rand() * 6 - 3).toFixed(1);
      // Pull just a bit off-screen so they peek in
      const offset = Math.floor(size * 0.25);

      return {
        src,
        side: zone.side,
        top: `calc(${zone.topPct}% + ${topJitter}px)`,
        offset,
        rotate,
        size,
        delay,
        duration,
      };
    });
  }, [count, seed]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden hidden md:block"
      style={{ zIndex: 45 }}
    >
      {items.map((p, i) => (
        <div
          key={i}
          className="absolute animate-float-photo"
          style={{
            top: p.top,
            [p.side]: `-${p.offset}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <div
            className="bg-white p-2 pb-5 shadow-2xl rounded-sm border border-white/80"
            style={{
              width: p.size,
              transform: `rotate(${p.rotate}deg)`,
            }}
          >
            <img
              src={p.src}
              alt=""
              loading="lazy"
              className="w-full h-auto object-cover block"
              style={{ aspectRatio: '4/5' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingPhotos;
