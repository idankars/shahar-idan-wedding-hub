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

// Deterministic pseudo-random for stable layout per page load
const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const FloatingPhotos = ({ count = 8, seed = 42 }: FloatingPhotosProps) => {
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const shuffled = [...PHOTOS].sort(() => rand() - 0.5);
    const picks = shuffled.slice(0, Math.min(count, PHOTOS.length));

    return picks.map((src, i) => {
      // Distribute across left/right edges with varied vertical positions
      const isLeft = i % 2 === 0;
      const horizontal = isLeft
        ? `${rand() * 8}%`
        : `${92 - rand() * 8}%`;
      const top = `${10 + (i / picks.length) * 80 + (rand() * 8 - 4)}%`;
      const rotate = (rand() * 24 - 12).toFixed(1);
      const size = 110 + Math.floor(rand() * 70); // 110-180px
      const delay = (rand() * 4).toFixed(2);
      const duration = (6 + rand() * 4).toFixed(2);
      const z = i;

      return { src, horizontal, top, rotate, size, delay, duration, z, isLeft };
    });
  }, [count, seed]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 hidden md:block"
    >
      {items.map((p, i) => (
        <div
          key={i}
          className="absolute animate-float-photo"
          style={{
            top: p.top,
            [p.isLeft ? 'left' : 'right']: `-${Math.floor(p.size * 0.3)}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            zIndex: p.z,
          }}
        >
          <div
            className="bg-white p-2 pb-6 shadow-2xl rounded-sm border border-white/60"
            style={{
              width: p.size,
              transform: `rotate(${p.rotate}deg)`,
            }}
          >
            <img
              src={p.src}
              alt=""
              loading="lazy"
              className="w-full h-auto object-cover"
              style={{ aspectRatio: '4/5' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingPhotos;
