import heroFloral from '@/assets/hero-floral.jpg';

const WeddingHeader = () => {
  return (
    <header className="relative overflow-hidden border-b border-border/50">
      <img
        src={heroFloral}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/90" />

      <div className="relative z-10 py-14 md:py-20 px-4 text-center">
        <p className="font-serif-en italic text-[11px] md:text-xs tracking-[0.5em] uppercase text-primary/80 mb-5">
          The Wedding of
        </p>

        <div className="flex items-center justify-center gap-5 md:gap-8 mb-5">
          <span className="hidden sm:block h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-primary/60" />
          <h1 className="font-display text-5xl md:text-7xl font-light text-foreground leading-none">
            <span className="text-gradient-gold font-normal">שחר</span>
            <span className="inline-block mx-3 md:mx-5 text-primary/70 text-3xl md:text-4xl align-middle" aria-hidden="true">&</span>
            <span className="text-gradient-gold font-normal">עידן</span>
          </h1>
          <span className="hidden sm:block h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-primary/60" />
        </div>

        <div className="flex items-center justify-center gap-3 text-muted-foreground font-body">
          <span className="h-1 w-1 rounded-full bg-primary/50" />
          <p className="text-sm md:text-base tracking-wider">20 · מאי · 2027</p>
          <span className="h-1 w-1 rounded-full bg-primary/50" />
          <p className="text-sm md:text-base tracking-wider">אולם הגבעה</p>
          <span className="h-1 w-1 rounded-full bg-primary/50" />
        </div>
      </div>
    </header>
  );
};

export default WeddingHeader;
