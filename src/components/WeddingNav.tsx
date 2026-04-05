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
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="flex gap-1 justify-center py-2.5 max-w-4xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default WeddingNav;
