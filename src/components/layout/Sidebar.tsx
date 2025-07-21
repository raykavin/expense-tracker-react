import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  FolderOpen, 
  CreditCard, 
  PieChart, 
  FileText, 
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Upload
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('transactions'), href: '/transactions', icon: ArrowUpDown },
    { name: t('categories'), href: '/categories', icon: FolderOpen },
    { name: t('accounts'), href: '/accounts', icon: CreditCard },
    { name: t('budget'), href: '/budget', icon: PieChart },
    { name: t('reports'), href: '/reports', icon: FileText },
    { name: t('goals'), href: '/goals', icon: Target },
    { name: t('import'), href: '/import', icon: Upload },
    { name: t('alerts'), href: '/alerts', icon: Bell },
  ];

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ease-in-out',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ET</span>
              </div>
              <span className="font-semibold text-lg">ExpenseTracker</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 p-0"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-border p-4">
          <Link
            to="/settings"
            className={cn(
              'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              location.pathname === '/settings' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>{t('settings')}</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}
