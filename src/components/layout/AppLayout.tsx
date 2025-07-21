import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { theme, sidebarOpen } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={cn(
      'min-h-screen bg-background text-foreground transition-colors',
      theme === 'dark' && 'dark'
    )}>
      <Sidebar />
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      )}>
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}