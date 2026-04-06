import { useNavigate } from 'react-router-dom';
import { Users, Truck, Calendar, MapPin, Heart, Wallet, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeddingHeader from '@/components/WeddingHeader';
import WeddingNav from '@/components/WeddingNav';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Guest, Vendor } from '@/types/wedding';

const Index = () => {
  const navigate = useNavigate();
  const [guests] = useSupabaseTable<Guest>('guests');
  const [vendors] = useSupabaseTable<Vendor>('vendors');

  const confirmedGuests = guests.filter((g) => g.status === 'מאשר');
  const totalAttending = confirmedGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  const totalBudget = vendors.reduce((sum, v) => sum + v.price, 0);
  const paidTotal = vendors.reduce((s, v) => s + (v.paid ?? 0), 0);
  const paidPercent = totalBudget > 0 ? Math.min((paidTotal / totalBudget) * 100, 100) : 0;

  const weddingDate = new Date('2027-05-20');
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.floor(daysLeft / 7);
  const monthsLeft = Math.floor(daysLeft / 30);

  const stats = [
    { label: 'מוזמנים', value: guests.length, icon: Users, accent: 'text-primary', bg: 'from-primary/10 via-primary/5 to-transparent' },
    { label: 'מאשרים', value: totalAttending, icon: Heart, accent: 'text-rose-500', bg: 'from-rose-100/60 via-rose-50/40 to-transparent' },
    { label: 'ספקים', value: vendors.length, icon: Truck, accent: 'text-emerald-600', bg: 'from-emerald-100/60 via-emerald-50/40 to-transparent' },
    { label: 'תקציב', value: `₪${(totalBudget / 1000).toFixed(0)}k`, icon: Wallet, accent: 'text-amber-600', bg: 'from-amber-100/60 via-amber-50/40 to-transparent' },
  ];

  return (
    <div className="min-h-screen">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
        {/* Hero Countdown */}
        <section className="luxe-card">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-light/40 via-transparent to-blush/30" />
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative px-6 py-12 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-body tracking-[0.2em] uppercase text-primary">הספירה לאחור</span>
            </div>

            <div className="font-display leading-none">
              <span className="block text-7xl md:text-9xl font-light text-gradient-gold tabular-nums">
                {daysLeft}
              </span>
              <span className="block mt-3 text-base md:text-lg text-muted-foreground tracking-[0.3em] uppercase font-body">
                ימים
              </span>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs font-body text-muted-foreground/80">
              <div>
                <p className="text-lg font-display text-foreground tabular-nums">{monthsLeft}</p>
                <p className="tracking-wider">חודשים</p>
              </div>
              <span className="h-8 w-px bg-border" />
              <div>
                <p className="text-lg font-display text-foreground tabular-nums">{weeksLeft}</p>
                <p className="tracking-wider">שבועות</p>
              </div>
              <span className="h-8 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary/60" />
                <p className="tracking-wider">אולם הגבעה</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="luxe-card group">
              <div className={`absolute inset-0 bg-gradient-to-b ${stat.bg} opacity-90`} />
              <div className="relative px-4 py-6 flex flex-col items-center text-center">
                <div className={`h-10 w-10 rounded-full bg-card flex items-center justify-center mb-3 shadow-soft ${stat.accent} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="font-display text-3xl font-light text-foreground tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-body mt-1 tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Budget progress */}
        {totalBudget > 0 && (
          <section className="luxe-card">
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-body">תקציב</p>
                  <p className="font-display text-xl mt-0.5">
                    <span className="tabular-nums">₪{paidTotal.toLocaleString()}</span>
                    <span className="text-muted-foreground/60 mx-1.5">/</span>
                    <span className="tabular-nums text-muted-foreground/80 text-base">₪{totalBudget.toLocaleString()}</span>
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-display text-2xl text-gradient-gold tabular-nums">{paidPercent.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground font-body">שולם</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-primary via-primary/90 to-primary/70 transition-all duration-700 ease-out"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3 md:gap-4">
          <Button
            onClick={() => navigate('/guests')}
            variant="outline"
            className="group h-16 rounded-2xl bg-card/80 border-border/60 backdrop-blur-sm hover:bg-card hover:shadow-luxe hover:-translate-y-0.5 transition-all duration-300 justify-between px-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="font-body text-sm">ניהול מוזמנים</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </Button>
          <Button
            onClick={() => navigate('/vendors')}
            variant="outline"
            className="group h-16 rounded-2xl bg-card/80 border-border/60 backdrop-blur-sm hover:bg-card hover:shadow-luxe hover:-translate-y-0.5 transition-all duration-300 justify-between px-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <span className="font-body text-sm">ניהול ספקים</span>
            </div>
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Index;
