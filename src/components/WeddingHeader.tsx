import heroFloral from '@/assets/hero-floral.jpg';

const WeddingHeader = () => {
  return (
    <div className="relative overflow-hidden bg-card py-8 text-center border-b border-border">
      <img
        src={heroFloral}
        alt="פרחים"
        width={1920}
        height={600}
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-display text-foreground mb-2">
          שחר ♥ עידן
        </h1>
        <p className="text-muted-foreground font-body text-lg">
          20.05.2027 · אולם הגבעה
        </p>
      </div>
    </div>
  );
};

export default WeddingHeader;
