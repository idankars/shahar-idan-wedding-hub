import { useNavigate } from 'react-router-dom';
import { Users, Truck, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WeddingHeader from '@/components/WeddingHeader';
import WeddingNav from '@/components/WeddingNav';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Guest, Vendor } from '@/types/wedding';

const Index = () => {
  const navigate = useNavigate();
  const [guests] = useLocalStorage<Guest[]>('wedding-guests', []);
  const [vendors] = useLocalStorage<Vendor[]>('wedding-vendors', []);

  const confirmedGuests = guests.filter((g) => g.status === 'מאשר');
  const totalAttending = confirmedGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  const totalBudget = vendors.reduce((sum, v) => sum + v.price, 0);
  const paidVendors = vendors.filter((v) => v.status === 'שולם').length;

  const stats = [
    { label: 'מוזמנים', value: guests.length, icon: Users, color: 'bg-accent text-accent-foreground' },
    { label: 'מאשרים הגעה', value: totalAttending, icon: Users, color: 'bg-secondary text-secondary-foreground' },
    { label: 'ספקים', value: vendors.length, icon: Truck, color: 'bg-gold-light text-foreground' },
    { label: 'תקציב כולל', value: `₪${totalBudget.toLocaleString()}`, icon: Truck, color: 'bg-blush text-foreground' },
  ];

  // Days until wedding
  const weddingDate = new Date('2027-05-20');
  const today = new Date();
  const daysLeft = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Countdown */}
        <Card className="border-primary/20 bg-card">
          <CardContent className="flex flex-col items-center py-8 gap-2">
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <p className="text-5xl font-display text-primary">{daysLeft}</p>
            <p className="text-muted-foreground font-body">ימים לחתונה</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>אולם הגבעה</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border">
              <CardContent className="flex flex-col items-center py-5 gap-1">
                <div className={`rounded-full p-2 mb-1 ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate('/guests')}
            className="h-16 text-base gap-2"
            variant="outline"
          >
            <Users className="h-5 w-5" />
            ניהול מוזמנים
          </Button>
          <Button
            onClick={() => navigate('/vendors')}
            className="h-16 text-base gap-2"
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
