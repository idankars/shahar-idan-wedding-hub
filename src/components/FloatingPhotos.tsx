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
  /**
   * - "default" spreads photos down the page
   * - "upper" packs them near the top
   * - "header" places them tucked into the page header area only (safe for full-width
   *   table layouts where the rest of the page has no gutters)
   */
  variant?: 'default' | 'upper' | 'header';
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
type Slot = {
  side: 'left' | 'right';
  top: number;
  size: number;
  float: boolean;
  /** Optional override for horizontal distance from center */
  xOffset?: number;
};

const SLOTS_DEFAULT: Slot[] = [
  { side: 'left',  top: 260, size: 200, float: true  },
  { side: 'right', top: 290, size: 140, float: false },
  { side: 'left',  top: 480, size: 145, float: false },
  { side: 'right', top: 520, size: 195, float: true  },
  { side: 'left',  top: 720, size: 170, float: true  },
  { side: 'right', top: 760, size: 135, float: false },
  { side: 'left',  top: 940, size: 150, float: false },
  { side: 'right', top: 970, size: 180, float: true  },
];

// Tucked inside the WeddingHeader band only (top < ~250px). Used on pages
// that have full-width content (e.g. the Guests table) where there are no
// side gutters below the header. 4 photos per side, arranged in 2 rows × 2
// columns (near/far from center) so they never overlap each other.
const SLOTS_HEADER: Slot[] = [
  // Top row — left side
  { side: 'left',  top: 8,   size: 110, float: false, xOffset: 280 },
  { side: 'left',  top: 18,  size: 95,  float: true,  xOffset: 420 },
  // Top row — right side
  { side: 'right', top: 12,  size: 105, float: true,  xOffset: 280 },
  { side: 'right', top: 22,  size: 100, float: false, xOffset: 420 },
  // Bottom row — left side
  { side: 'left',  top: 140, size: 105, float: true,  xOffset: 280 },
  { side: 'left',  top: 150, size: 95,  float: false, xOffset: 420 },
  // Bottom row — right side
  { side: 'right', top: 135, size: 110, float: false, xOffset: 280 },
  { side: 'right', top: 145, size: 100, float: true,  xOffset: 420 },
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
    const source =
      variant === 'header' ? SLOTS_HEADER :
      variant === 'upper'  ? SLOTS_UPPER  :
      SLOTS_DEFAULT;
    const slots = source.slice(0, Math.min(count, source.length));

    // How far the photo's near edge sits from horizontal center.
    // For default/upper we push past the max-w-4xl content edge (~448px).
    // For header we tuck in closer so photos hug the title band but stay
    // clear of the centered "שחר ♥ עידן" text.
    const baseOffset = variant === 'header' ? 320 : 470;

    return slots.map((slot, i) => {
      const src = shuffledPhotos[i % shuffledPhotos.length];
      const rotate = (rand() * 14 - 7).toFixed(1);
      const delay = (rand() * 4).toFixed(2);
      const duration = (7 + rand() * 4).toFixed(2);
      // No jitter when slot has its own xOffset (header layout) so the
      // 2-column near/far columns don't drift into each other.
      const sideJitter = slot.xOffset != null ? 0 : Math.floor(rand() * 24);
      const xOffset = slot.xOffset ?? baseOffset;

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
        xOffset,
      };
    });
  }, [count, seed, variant]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden xl:block"
      style={{ zIndex: 50 }}
    >
      {items.map((p, i) => (
        <div
          key={i}
          className={p.float ? 'absolute animate-float-photo' : 'absolute'}
          style={{
            top: `${p.top}px`,
            // Push beyond the centered max-w-4xl (896px) content edge so photos
            // sit in the gutter and never overlap the cards/text.
            [p.side === 'left' ? 'right' : 'left']: `calc(50% + ${p.xOffset}px + ${p.sideJitter}px)`,
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
