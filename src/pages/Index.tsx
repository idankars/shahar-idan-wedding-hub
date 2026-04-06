import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Truck, Heart, Wallet, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeddingHeader from '@/components/WeddingHeader';
import WeddingNav from '@/components/WeddingNav';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Guest, Vendor } from '@/types/wedding';

const WEDDING_DATE = new Date('2027-05-20T19:00:00');

const useCountdown = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, WEDDING_DATE.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

const Index = () => {
  const navigate = useNavigate();
  const [guests] = useSupabaseTable<Guest>('guests');
  const [vendors] = useSupabaseTable<Vendor>('vendors');
  const { days, hours, minutes, seconds } = useCountdown();

  const confirmedGuests = guests.filter((g) => g.status === 'מאשר');
  const totalAttending = confirmedGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  const totalBudget = vendors.reduce((sum, v) => sum + v.price, 0);
  const paidTotal = vendors.reduce((s, v) => s + (v.paid ?? 0), 0);
  const paidPercent = totalBudget > 0 ? Math.min((paidTotal / totalBudget) * 100, 100) : 0;
  const monthsLeft = Math.floor(days / 30);
  const weeksLeft = Math.floor(days / 7);

  const stats = [
    {
      label: 'מוזמנים',
      sub: 'Invited',
      value: guests.length,
      icon: Users,
      color: 'text-primary',
      ring: 'ring-primary/20',
      bg: 'from-primary/15 via-primary/5 to-transparent',
    },
    {
      label: 'מאשרים',
      sub: 'Attending',
      value: totalAttending,
      icon: Heart,
      color: 'text-rose-500',
      ring: 'ring-rose-300/30',
      bg: 'from-rose-200/50 via-rose-100/30 to-transparent',
    },
    {
      label: 'ספקים',
      sub: 'Vendors',
      value: vendors.length,
      icon: Truck,
      color: 'text-emerald-600',
      ring: 'ring-emerald-300/30',
      bg: 'from-emerald-200/50 via-emerald-100/30 to-transparent',
    },
    {
      label: 'תקציב',
      sub: 'Budget',
      value: `₪${(totalBudget / 1000).toFixed(0)}k`,
      icon: Wallet,
      color: 'text-amber-600',
      ring: 'ring-amber-300/30',
      bg: 'from-amber-200/50 via-amber-100/30 to-transparent',
    },
  ];

  const countdownCells = [
    { value: days, label: 'ימים', sub: 'Days' },
    { value: hours, label: 'שעות', sub: 'Hours' },
    { value: minutes, label: 'דקות', sub: 'Minutes' },
    { value: seconds, label: 'שניות', sub: 'Seconds' },
  ];

  return (
    <div className="min-h-screen">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-5xl mx-auto py-12 px-4 space-y-12">
        {/* Hero Countdown */}
        <section className="luxe-card-elevated grain animate-reveal">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-light/50 via-transparent to-blush/30" />
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-slow-pulse" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-300/15 blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }} />

          <div className="relative px-6 py-14 md:py-20 text-center">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="h-px w-10 bg-gradient-to-l from-primary/50 to-transparent" />
              <Sparkles className="h-3.5 w-3.5 text-primary/70" />
              <p className="font-serif-en italic text-xs tracking-[0.4em] uppercase text-primary/80">
                Counting Down
              </p>
              <Sparkles className="h-3.5 w-3.5 text-primary/70" />
              <span className="h-px w-10 bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Big day number */}
            <div className="font-display leading-none mb-2">
              <span className="block text-[6rem] md:text-[10rem] font-light text-gradient-shimmer tabular-nums tracking-tighter">
                {days}
              </span>
              <span className="block mt-2 text-sm md:text-base text-muted-foreground tracking-[0.5em] uppercase font-body">
                ימים נותרו
              </span>
            </div>

            {/* Countdown grid */}
            <div className="mt-10 mx-auto max-w-2xl grid grid-cols-4 gap-2 md:gap-4">
              {countdownCells.map((cell, idx) => (
                <div key={cell.label} className="countdown-cell group">
                  <div className="relative w-full rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm px-2 py-4 md:py-5 transition-all hover:border-primary/40">
                    <p className="font-display text-3xl md:text-5xl text-foreground tabular-nums font-light">
                      {String(cell.value).padStart(2, '0')}
                    </p>
                    <p className="text-[9px] md:text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-body mt-1">
                      {cell.label}
                    </p>
                    <p className="font-serif-en italic text-[9px] text-primary/50 mt-0.5">{cell.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Sub-stats */}
            <div className="mt-10 flex items-center justify-center gap-6 md:gap-10 text-xs font-body text-muted-foreground/80">
              <div className="text-center">
                <p className="font-display text-xl text-foreground tabular-nums">{monthsLeft}</p>
                <p className="tracking-[0.2em] uppercase text-[10px] mt-0.5">חודשים</p>
              </div>
              <span className="h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center">
                <p className="font-display text-xl text-foreground tabular-nums">{weeksLeft}</p>
                <p className="tracking-[0.2em] uppercase text-[10px] mt-0.5">שבועות</p>
              </div>
              <span className="h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="text-center">
                <p className="font-italiana text-xl text-foreground">20.05.27</p>
                <p className="tracking-[0.2em] uppercase text-[10px] mt-0.5">Save Date</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Heading */}
        <div className="text-center space-y-2 animate-reveal" style={{ animationDelay: '0.1s' }}>
          <p className="font-serif-en italic text-xs tracking-[0.4em] uppercase text-primary/70">Overview</p>
          <h2 className="font-display text-3xl md:text-4xl text-gradient-gold font-light">סקירה כללית</h2>
          <div className="ornament-divider max-w-xs mx-auto pt-2">
            <div className="h-1 w-1 rounded-full bg-primary/50" />
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="stat-tile group animate-reveal"
              style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${stat.bg}`} />
              <div className="relative px-4 py-7 flex flex-col items-center text-center">
                <div className={`relative h-14 w-14 rounded-full bg-card flex items-center justify-center mb-4 shadow-soft ring-1 ${stat.ring} ring-offset-2 ring-offset-background/0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className={`absolute inset-0 rounded-full ring-1 ${stat.ring} animate-slow-pulse`} />
                </div>
                <p className="font-display text-4xl font-light text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-body mt-1.5 tracking-[0.15em]">{stat.label}</p>
                <p className="font-serif-en italic text-[10px] text-primary/50 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Budget progress */}
        {totalBudget > 0 && (
          <section className="luxe-card animate-reveal" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-gold-light/30 via-transparent to-champagne/20" />
            <div className="relative px-6 md:px-8 py-7 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif-en italic text-[11px] tracking-[0.3em] uppercase text-primary/70">Budget</p>
                  <p className="font-display text-2xl mt-1.5">
                    <span className="tabular-nums text-foreground">₪{paidTotal.toLocaleString()}</span>
                    <span className="text-muted-foreground/50 mx-2">/</span>
                    <span className="tabular-nums text-muted-foreground/70 text-lg">₪{totalBudget.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-1">תקציב כולל</p>
                </div>
                <div className="text-left">
                  <p className="font-display text-4xl text-gradient-shimmer tabular-nums font-light">{paidPercent.toFixed(0)}%</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mt-1">שולם</p>
                </div>
              </div>
              <div className="relative h-2.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-primary via-gold to-primary/80 transition-all duration-1000 ease-out shadow-glow-gold"
                  style={{ width: `${paidPercent}%` }}
                />
                <div
                  className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                  style={{ left: `${Math.max(0, paidPercent - 10)}%`, animation: 'shimmer 3s linear infinite' }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions Section */}
        <div className="text-center space-y-2 animate-reveal" style={{ animationDelay: '0.4s' }}>
          <p className="font-serif-en italic text-xs tracking-[0.4em] uppercase text-primary/70">Manage</p>
          <h2 className="font-display text-3xl md:text-4xl text-gradient-gold font-light">ניהול</h2>
          <div className="ornament-divider max-w-xs mx-auto pt-2">
            <div className="h-1 w-1 rounded-full bg-primary/50" />
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 animate-reveal" style={{ animationDelay: '0.45s' }}>
          {[
            { to: '/guests', icon: Users, label: 'ניהול מוזמנים', sub: 'Guest List', count: guests.length },
            { to: '/vendors', icon: Truck, label: 'ניהול ספקים', sub: 'Vendors', count: vendors.length },
          ].map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className="luxe-card group text-right p-0"
            >
              <div className="absolute inset-0 bg-gradient-to-l from-gold-light/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-1 ring-primary/10 group-hover:ring-primary/30 transition-all">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">{action.label}</p>
                    <p className="font-serif-en italic text-xs text-primary/60 mt-0.5">{action.sub} · {action.count}</p>
                  </div>
                </div>
                <div className="h-9 w-9 rounded-full bg-card border border-border/60 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:-translate-x-1 transition-all duration-300">
                  <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </section>

        {/* Footer ornament */}
        <div className="pt-8 pb-4 flex flex-col items-center gap-3">
          <svg width="32" height="20" viewBox="0 0 32 20" className="text-primary/40" fill="none">
            <path d="M2 10 Q 8 4, 16 10 T 30 10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
            <circle cx="16" cy="10" r="1.5" fill="currentColor" />
          </svg>
          <p className="font-serif-en italic text-xs text-muted-foreground/60 tracking-wider">
            Made with love · שחר &amp; עידן
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
