import { Link, useLocation } from 'react-router-dom';
import { Users, Truck, Home } from 'lucide-react';

const navItems = [
  { to: '/', label: 'ראשי', sub: 'Home', icon: Home },
  { to: '/guests', label: 'מוזמנים', sub: 'Guests', icon: Users },
  { to: '/vendors', label: 'ספקים', sub: 'Vendors', icon: Truck },
];

const WeddingNav = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-4 z-40 px-4">
      <div className="mx-auto max-w-md">
        <div className="relative glass-strong border border-border/60 rounded-full shadow-luxe p-1.5 flex gap-1">
          {/* Active indicator background line */}
          <div className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-500 group ${
                  isActive
                    ? 'bg-gradient-to-b from-primary via-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full ring-1 ring-primary/30 ring-offset-2 ring-offset-card/50" />
                )}
                <item.icon className={`h-4 w-4 transition-transform duration-500 ${isActive ? '' : 'group-hover:scale-110'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default WeddingNav;
