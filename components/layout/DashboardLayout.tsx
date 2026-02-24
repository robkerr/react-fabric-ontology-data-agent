'use client';

import { cn } from '@/lib/utils';
import { Truck } from 'lucide-react';

const navItems = [
  { label: 'Home', key: 'home' },
  { label: 'Fleet', key: 'fleet' },
  { label: 'Drivers', key: 'drivers' },
  { label: 'Loads', key: 'loads' },
  { label: 'Trips', key: 'trips' },
  { label: 'Tracking', key: 'tracking' },
  { label: 'Maintenance', key: 'maintenance' },
];

interface DashboardLayoutProps {
  activeNav: string;
  onNavChange?: (key: string) => void;
  children: React.ReactNode;
}

export function DashboardLayout({ activeNav, onNavChange, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="border-b bg-background shrink-0">
        <div className="flex items-center gap-3 px-6 py-3">
          <Truck className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Contoso Trucking</h1>
          <span className="text-xs text-muted-foreground font-medium ml-1 mt-0.5">Operations Center</span>
        </div>
        <nav className="flex gap-1 px-6 pb-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavChange?.(item.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeNav === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
