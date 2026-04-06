import heroFloral from '@/assets/hero-floral.jpg';

const WeddingHeader = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Background image with refined treatment */}
      <img
        src={heroFloral}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.14] scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background)/0.6)_70%)]" />

      {/* Floating ornamental dots */}
      <div className="absolute top-10 right-[20%] h-1 w-1 rounded-full bg-primary/40 animate-slow-pulse" />
      <div className="absolute top-20 left-[18%] h-1 w-1 rounded-full bg-primary/40 animate-slow-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-12 right-[30%] h-1 w-1 rounded-full bg-primary/30 animate-slow-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 py-16 md:py-24 px-4 text-center">
        {/* Top eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="h-px w-8 bg-primary/40" />
          <p className="font-serif-en italic text-[10px] md:text-xs tracking-[0.45em] uppercase text-primary/80">
            The Wedding of
          </p>
          <span className="h-px w-8 bg-primary/40" />
        </div>

        {/* Monogram + Names */}
        <div className="relative inline-block">
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none">
            <span className="text-gradient-gold font-normal">שחר</span>
            <span className="inline-block mx-4 md:mx-6 align-middle relative">
              <svg width="32" height="40" viewBox="0 0 32 40" className="inline-block text-primary/70" fill="none">
                <path d="M16 2 C 22 8, 26 14, 16 20 C 6 26, 10 32, 16 38" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                <circle cx="16" cy="20" r="1" fill="currentColor" />
              </svg>
            </span>
            <span className="text-gradient-gold font-normal">עידן</span>
          </h1>
        </div>

        {/* Italian flourish */}
        <p className="font-serif-en italic text-base md:text-lg text-muted-foreground/80 mt-4 mb-8">
          together forever
        </p>

        {/* Ornamental divider */}
        <div className="ornament-divider max-w-md mx-auto mb-8">
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-primary/60" fill="none">
            <path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Date & venue */}
        <div className="flex items-center justify-center gap-4 md:gap-6 text-muted-foreground font-body">
          <div className="text-center">
            <p className="font-italiana text-2xl md:text-3xl text-foreground">20</p>
            <p className="text-[10px] tracking-[0.25em] uppercase mt-1">May</p>
          </div>
          <span className="h-10 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
          <div className="text-center">
            <p className="font-italiana text-2xl md:text-3xl text-foreground">2027</p>
            <p className="text-[10px] tracking-[0.25em] uppercase mt-1">Year</p>
          </div>
          <span className="h-10 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
          <div className="text-center">
            <p className="font-italiana text-base md:text-lg text-foreground tracking-wider">אולם הגבעה</p>
            <p className="text-[10px] tracking-[0.25em] uppercase mt-1">Venue</p>
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="relative h-px">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </header>
  );
};

export default WeddingHeader;
