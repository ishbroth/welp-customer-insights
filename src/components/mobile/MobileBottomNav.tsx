import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Bell, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/auth';

interface MobileBottomNavProps {
  onMenuToggle?: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();

  if (!isMobile || !currentUser) return null;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/notifications', icon: Bell, label: 'Alerts' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Menu toggle button */}
        <button
          onClick={onMenuToggle}
          className="flex flex-col items-center py-2 px-3 rounded-lg transition-colors text-gray-600 hover:text-primary hover:bg-gray-50"
        >
          <Menu className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;