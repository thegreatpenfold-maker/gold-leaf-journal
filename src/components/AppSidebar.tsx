import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, PlusCircle, BarChart3, CalendarDays,
  BookOpen, Library, Calculator, Newspaper, Link2, Settings, ChevronLeft,
  ChevronRight, Flame, TrendingUp, LogOut,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
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
    <div className={`px-3 py-3 ${collapsed ? 'px-2' : ''}`}>
      {!collapsed && <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mb-2 font-medium">Markets</p>}
      <div className={`flex ${collapsed ? 'flex-col items-center gap-1.5' : 'flex-col gap-1'}`}>
        {MARKET_SESSIONS.map(s => {
          const isOpen = s.open < s.close
            ? utcH >= s.open && utcH < s.close
            : utcH >= s.open || utcH < s.close;
          return (
            <div key={s.name} className={`flex items-center gap-2 ${collapsed ? '' : 'text-[11px]'}`} title={`${s.name} ${isOpen ? 'OPEN' : 'CLOSED'}`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOpen ? 'bg-success' : 'bg-sidebar-foreground/20'}`} />
              {!collapsed && <span className={`${isOpen ? 'text-success font-medium' : 'text-sidebar-foreground/50'}`}>{s.name}</span>}
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

  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  let streakType: 'win' | 'loss' | null = null;
  for (const t of sortedTrades) {
    if (t.result === 'Breakeven') continue;
    if (!streakType) { streakType = t.result === 'Win' ? 'win' : 'loss'; streak = 1; }
    else if ((t.result === 'Win' && streakType === 'win') || (t.result === 'Loss' && streakType === 'loss')) streak++;
    else break;
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const item = navItems.find(n => n.shortcut.toLowerCase() === e.key.toLowerCase());
      if (item) window.location.hash = '';
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="h-screen bg-sidebar flex flex-col fixed left-0 top-0 z-50"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm gold-text tracking-tight">Penfoldfx</span>
          </div>
        )}
        {collapsed && <TrendingUp className="w-5 h-5 text-primary mx-auto" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className={`px-4 py-2 border-b border-sidebar-border ${collapsed ? 'px-2 text-center' : ''}`}>
          <div className="flex items-center gap-1.5 justify-center">
            {streakType === 'win' && <Flame className="w-3.5 h-3.5 text-warning" />}
            <span className={`text-[11px] font-semibold ${streakType === 'win' ? 'text-success' : 'text-destructive'}`}>
              {collapsed ? streak : `${streak} ${streakType === 'win' ? 'Win' : 'Loss'} Streak`}
            </span>
            {streakType === 'win' && !collapsed && <span className="text-xs">🔥</span>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-[13px] transition-all duration-100
              ${isActive
                ? 'bg-sidebar-accent text-primary font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }
              ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={16} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
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
