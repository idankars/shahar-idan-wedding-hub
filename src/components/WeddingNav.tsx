import { Link, useLocation } from 'react-router-dom';
import { Users, Truck, Home } from 'lucide-react';

const navItems = [
  { to: '/', label: 'ראשי', icon: Home },
  { to: '/guests', label: 'מוזמנים', icon: Users },
  { to: '/vendors', label: 'ספקים', icon: Truck },
];

const WeddingNav = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-4 z-40 px-4">
      <div className="mx-auto max-w-md">
        <div className="glass border border-border/60 rounded-full shadow-luxe p-1.5 flex gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default WeddingNav;
