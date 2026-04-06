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

// Photos live in the side gutters, OUTSIDE the centered max-w-4xl content (~896px wide).
// They scroll with the page (absolute, not fixed) and are staggered top-to-bottom
// so nothing overlaps. Each slot uses an absolute Y position in pixels.
const SLOTS: Array<{ side: 'left' | 'right'; top: number }> = [
  { side: 'left',  top: 80 },
  { side: 'right', top: 140 },
  { side: 'left',  top: 360 },
  { side: 'right', top: 440 },
  { side: 'left',  top: 680 },
  { side: 'right', top: 760 },
  { side: 'left',  top: 1000 },
  { side: 'right', top: 1080 },
  { side: 'left',  top: 1320 },
  { side: 'right', top: 1400 },
];

const FloatingPhotos = ({ count = 6, seed = 42 }: FloatingPhotosProps) => {
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const shuffledPhotos = [...PHOTOS].sort(() => rand() - 0.5);
    const slots = SLOTS.slice(0, Math.min(count, SLOTS.length));

    return slots.map((slot, i) => {
      const src = shuffledPhotos[i % shuffledPhotos.length];
      const rotate = (rand() * 16 - 8).toFixed(1);
      const size = 110 + Math.floor(rand() * 40); // 110-150px
      const delay = (rand() * 4).toFixed(2);
      const duration = (7 + rand() * 4).toFixed(2);
      // Slight horizontal jitter inside the gutter
      const sideJitter = Math.floor(rand() * 30);

      return {
        src,
        side: slot.side,
        top: slot.top,
        sideJitter,
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
      className="pointer-events-none absolute inset-0 overflow-hidden hidden xl:block"
      style={{ zIndex: 1 }}
    >
      {items.map((p, i) => (
        <div
          key={i}
          className="absolute animate-float-photo"
          style={{
            top: `${p.top}px`,
            // Push beyond the centered max-w-4xl (896px) content edge so photos
            // sit in the gutter and never overlap the cards/text.
            [p.side === 'left' ? 'right' : 'left']: `calc(50% + 470px + ${p.sideJitter}px)`,
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
