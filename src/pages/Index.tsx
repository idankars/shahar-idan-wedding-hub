import { useNavigate } from 'react-router-dom';
import { Users, Truck, Calendar, MapPin, Heart, Wallet, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WeddingHeader from '@/components/WeddingHeader';
import WeddingNav from '@/components/WeddingNav';
import FloatingPhotos from '@/components/FloatingPhotos';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Guest, Vendor } from '@/types/wedding';

const Index = () => {
  const navigate = useNavigate();
  const [guests] = useSupabaseTable<Guest>('guests');
  const [vendors] = useSupabaseTable<Vendor>('vendors');

  const confirmedGuests = guests.filter((g) => g.status === 'מאשר');
  const totalAttending = confirmedGuests.reduce((sum, g) => sum + (g.numberOfGuests || 1), 0);
  const totalInvited = guests.reduce((sum, g) => sum + (g.numberOfGuests || 1), 0);
  const totalBudget = vendors.reduce((sum, v) => sum + v.price, 0);
  const paidTotal = vendors.reduce((s, v) => s + (v.paid ?? 0), 0);

  const weddingDate = new Date('2027-05-20');
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.floor(daysLeft / 7);
  const monthsLeft = Math.floor(daysLeft / 30);

  return (
    <div className="min-h-screen relative">
      <FloatingPhotos count={10} seed={7} />
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Countdown */}
        <Card className="border-primary/20 bg-gradient-to-b from-card to-background overflow-hidden relative">
          <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
          <CardContent className="flex flex-col items-center py-12 gap-3 relative">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-[0.06] animate-float-gentle">
              <Heart className="h-32 w-32 text-primary" fill="currentColor" />
            </div>
            <Calendar className="h-7 w-7 text-primary relative" />
            <p className="text-7xl md:text-8xl font-display text-gradient-gold tracking-tight tabular-nums leading-none">{daysLeft}</p>
            <p className="text-muted-foreground font-body text-base tracking-wider">ימים לחתונה</p>

            <div className="flex items-center gap-5 mt-4 text-xs font-body text-muted-foreground/80">
              <div className="text-center">
                <p className="font-display text-lg text-foreground tabular-nums">{monthsLeft}</p>
                <p className="tracking-wider">חודשים</p>
              </div>
              <span className="h-7 w-px bg-border" />
              <div className="text-center">
                <p className="font-display text-lg text-foreground tabular-nums">{weeksLeft}</p>
                <p className="tracking-wider">שבועות</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground/70 mt-3">
              <MapPin className="h-3.5 w-3.5" />
              <span>אולם הגבעה</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'סה״כ מוזמנים', value: totalInvited, icon: Users, gradient: 'from-primary/10 to-primary/5', iconColor: 'text-primary' },
            { label: 'מאשרים הגעה', value: totalAttending, icon: Heart, gradient: 'from-secondary/60 to-secondary/30', iconColor: 'text-sage-dark' },
            { label: 'ספקים', value: vendors.length, icon: Truck, gradient: 'from-accent/60 to-accent/30', iconColor: 'text-accent-foreground' },
            { label: 'תקציב', value: `₪${totalBudget.toLocaleString()}`, icon: Wallet, gradient: 'from-gold-light to-gold-light/50', iconColor: 'text-primary' },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
              <CardContent className={`flex flex-col items-center py-6 gap-1.5 bg-gradient-to-b ${stat.gradient} relative`}>
                <div className="h-9 w-9 rounded-full bg-card/80 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <p className="text-2xl font-display tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Budget progress */}
        {totalBudget > 0 && (
          <Card className="border-border/50">
            <CardContent className="py-5 space-y-3">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">שולם</span>
                <span className="font-medium">₪{paidTotal.toLocaleString()} / ₪{totalBudget.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min((paidTotal / totalBudget) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate('/guests')}
            className="h-16 text-base gap-3 rounded-xl bg-card/70 backdrop-blur-sm border-border/60 hover:bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 justify-between px-5 group"
            variant="outline"
          >
            <span className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </span>
              <span className="font-body">ניהול מוזמנים</span>
            </span>
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </Button>
          <Button
            onClick={() => navigate('/vendors')}
            className="h-16 text-base gap-3 rounded-xl bg-card/70 backdrop-blur-sm border-border/60 hover:bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 justify-between px-5 group"
            variant="outline"
          >
            <span className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-4 w-4 text-primary" />
              </span>
              <span className="font-body">ניהול ספקים</span>
            </span>
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
