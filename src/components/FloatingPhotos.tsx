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
  /** "default" spreads photos down the page; "upper" packs them near the top */
  variant?: 'default' | 'upper';
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
// They scroll with the page (absolute, not fixed). Top values start BELOW the
// opaque WeddingHeader so nothing covers them.
// `size` lets some photos be intentionally larger; `float` flips animation on/off.
type Slot = { side: 'left' | 'right'; top: number; size: number; float: boolean };

const SLOTS_DEFAULT: Slot[] = [
  { side: 'left',  top: 260,  size: 210, float: true  },
  { side: 'right', top: 300,  size: 140, float: false },
  { side: 'left',  top: 540,  size: 150, float: false },
  { side: 'right', top: 600,  size: 200, float: true  },
  { side: 'left',  top: 840,  size: 175, float: true  },
  { side: 'right', top: 920,  size: 135, float: false },
  { side: 'left',  top: 1180, size: 145, float: false },
  { side: 'right', top: 1240, size: 195, float: true  },
  { side: 'left',  top: 1500, size: 165, float: false },
  { side: 'right', top: 1560, size: 130, float: true  },
];

// Packed near the top — photos stay above the fold so they're visible
// before the user starts scrolling.
const SLOTS_UPPER: Slot[] = [
  { side: 'left',  top: 240, size: 200, float: true  },
  { side: 'right', top: 270, size: 175, float: false },
  { side: 'left',  top: 470, size: 145, float: false },
  { side: 'right', top: 500, size: 195, float: true  },
  { side: 'left',  top: 700, size: 160, float: true  },
  { side: 'right', top: 740, size: 135, float: false },
  { side: 'left',  top: 930, size: 180, float: false },
  { side: 'right', top: 970, size: 150, float: true  },
];

const FloatingPhotos = ({ count = 6, seed = 42, variant = 'default' }: FloatingPhotosProps) => {
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const shuffledPhotos = [...PHOTOS].sort(() => rand() - 0.5);
    const source = variant === 'upper' ? SLOTS_UPPER : SLOTS_DEFAULT;
    const slots = source.slice(0, Math.min(count, source.length));

    return slots.map((slot, i) => {
      const src = shuffledPhotos[i % shuffledPhotos.length];
      const rotate = (rand() * 14 - 7).toFixed(1);
      const delay = (rand() * 4).toFixed(2);
      const duration = (7 + rand() * 4).toFixed(2);
      const sideJitter = Math.floor(rand() * 24);

      return {
        src,
        side: slot.side,
        top: slot.top,
        size: slot.size,
        float: slot.float,
        sideJitter,
        rotate,
        delay,
        duration,
      };
    });
  }, [count, seed, variant]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden xl:block"
      style={{ zIndex: 5 }}
    >
      {items.map((p, i) => (
        <div
          key={i}
          className={p.float ? 'absolute animate-float-photo' : 'absolute'}
          style={{
            top: `${p.top}px`,
            // Push beyond the centered max-w-4xl (896px) content edge so photos
            // sit in the gutter and never overlap the cards/text.
            [p.side === 'left' ? 'right' : 'left']: `calc(50% + 470px + ${p.sideJitter}px)`,
            animationDelay: p.float ? `${p.delay}s` : undefined,
            animationDuration: p.float ? `${p.duration}s` : undefined,
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
