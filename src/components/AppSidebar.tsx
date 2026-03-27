import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, PlusCircle, BarChart3, CalendarDays,
  BookOpen, Library, Calculator, Newspaper, Link2, Settings, ChevronLeft,
  ChevronRight, Flame, TrendingUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MARKET_SESSIONS } from '@/lib/types';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', shortcut: 'D' },
  { path: '/trades', icon: ClipboardList, label: 'Trade Log', shortcut: 'T' },
  { path: '/add-trade', icon: PlusCircle, label: 'Add Trade', shortcut: 'N' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics', shortcut: 'A' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar', shortcut: 'C' },
  { path: '/journal', icon: BookOpen, label: 'Journal', shortcut: 'J' },
  { path: '/playbook', icon: Library, label: 'Playbook', shortcut: 'P' },
  { path: '/risk-calculator', icon: Calculator, label: 'Risk Calc', shortcut: 'R' },
  { path: '/economic-calendar', icon: Newspaper, label: 'Econ Calendar', shortcut: 'E' },
  { path: '/accounts', icon: Link2, label: 'Accounts', shortcut: 'B' },
  { path: '/settings', icon: Settings, label: 'Settings', shortcut: 'S' },
];

function SessionClock({ collapsed }: { collapsed: boolean }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const utcH = now.getUTCHours();

  return (
    <div className={`px-3 py-2 ${collapsed ? 'px-1' : ''}`}>
      {!collapsed && <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Markets</p>}
      <div className={`flex ${collapsed ? 'flex-col items-center gap-1' : 'flex-wrap gap-1'}`}>
        {MARKET_SESSIONS.map(s => {
          const isOpen = s.open < s.close
            ? utcH >= s.open && utcH < s.close
            : utcH >= s.open || utcH < s.close;
          return (
            <div key={s.name} className={`flex items-center gap-1 ${collapsed ? '' : 'text-[10px]'}`} title={`${s.name} ${isOpen ? 'OPEN' : 'CLOSED'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
              {!collapsed && <span className={isOpen ? 'text-success font-medium' : 'text-muted-foreground'}>{s.name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { trades } = useApp();
  const location = useLocation();

  // Calculate streak
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  let streakType: 'win' | 'loss' | null = null;
  for (const t of sortedTrades) {
    if (t.result === 'Breakeven') continue;
    if (!streakType) { streakType = t.result === 'Win' ? 'win' : 'loss'; streak = 1; }
    else if ((t.result === 'Win' && streakType === 'win') || (t.result === 'Loss' && streakType === 'loss')) streak++;
    else break;
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const item = navItems.find(n => n.shortcut.toLowerCase() === e.key.toLowerCase());
      if (item) window.location.hash = ''; // handled by router
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg gold-text">ForexPro</span>
          </div>
        )}
        {collapsed && <TrendingUp className="w-6 h-6 text-primary mx-auto" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground hover:text-primary transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className={`px-3 py-2 border-b border-sidebar-border ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-1 justify-center">
            {streakType === 'win' && <Flame className="w-4 h-4 text-warning" />}
            <span className={`text-xs font-semibold ${streakType === 'win' ? 'text-success' : 'text-destructive'}`}>
              {collapsed ? streak : `${streak} ${streakType === 'win' ? 'Win' : 'Loss'} Streak`}
            </span>
            {streakType === 'win' && !collapsed && <span>🔥</span>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-all duration-150
              ${isActive
                ? 'bg-sidebar-accent text-primary font-semibold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }
              ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && (
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">{item.shortcut}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Session Clock */}
      <div className="border-t border-sidebar-border">
        <SessionClock collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
