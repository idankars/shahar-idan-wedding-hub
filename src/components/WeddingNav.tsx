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
    <nav className="flex gap-1 justify-center py-3 bg-background border-b border-border">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-body text-sm transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default WeddingNav;
