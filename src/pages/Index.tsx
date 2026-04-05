import { useNavigate } from 'react-router-dom';
import { Users, Truck, Calendar, MapPin, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  const weddingDate = new Date('2027-05-20');
  const today = new Date();
  const daysLeft = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Countdown */}
        <Card className="border-primary/20 bg-gradient-to-b from-card to-background overflow-hidden">
          <CardContent className="flex flex-col items-center py-10 gap-3 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-5">
              <Heart className="h-32 w-32 text-primary" />
            </div>
            <Calendar className="h-7 w-7 text-primary" />
            <p className="text-6xl font-display text-primary tracking-tight">{daysLeft}</p>
            <p className="text-muted-foreground font-body text-base">ימים לחתונה</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground/70 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>אולם הגבעה</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'סה״כ מוזמנים', value: guests.length, icon: Users, gradient: 'from-primary/10 to-primary/5' },
            { label: 'מאשרים הגעה', value: totalAttending, icon: Heart, gradient: 'from-secondary/60 to-secondary/30' },
            { label: 'ספקים', value: vendors.length, icon: Truck, gradient: 'from-accent/60 to-accent/30' },
            { label: 'תקציב', value: `₪${totalBudget.toLocaleString()}`, icon: Truck, gradient: 'from-gold-light to-gold-light/50' },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50 overflow-hidden">
              <CardContent className={`flex flex-col items-center py-6 gap-1.5 bg-gradient-to-b ${stat.gradient}`}>
                <stat.icon className="h-5 w-5 text-primary/70 mb-1" />
                <p className="text-2xl font-display">{stat.value}</p>
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
            className="h-14 text-base gap-2 rounded-xl"
            variant="outline"
          >
            <Users className="h-5 w-5" />
            ניהול מוזמנים
          </Button>
          <Button
            onClick={() => navigate('/vendors')}
            className="h-14 text-base gap-2 rounded-xl"
            variant="outline"
          >
            <Truck className="h-5 w-5" />
            ניהול ספקים
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
