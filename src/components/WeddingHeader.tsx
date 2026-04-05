import heroFloral from '@/assets/hero-floral.jpg';

const WeddingHeader = () => {
  return (
    <div className="relative overflow-hidden bg-card border-b border-border">
      <img
        src={heroFloral}
        alt="פרחים"
        width={1920}
        height={600}
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      />
      <div className="relative z-10 py-10 md:py-14 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-primary/70 font-body mb-3">The Wedding of</p>
        <h1 className="text-5xl md:text-6xl font-display text-foreground mb-3 tracking-tight">
          שחר <span className="text-primary mx-2">♥</span> עידן
        </h1>
        <div className="flex items-center justify-center gap-3 text-muted-foreground font-body">
          <span className="h-px w-12 bg-primary/30" />
          <p className="text-base">20.05.2027 · אולם הגבעה</p>
          <span className="h-px w-12 bg-primary/30" />
        </div>
      </div>
    </div>
  );
};

export default WeddingHeader;
