import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, BarChart3, BookOpen, CalendarDays, Link2 } from 'lucide-react';

export default function OnboardingModal() {
  const { onboarded, setOnboarded } = useApp();
  const [show, setShow] = useState(!onboarded);

  if (!show) return null;

  const handleClose = () => { setOnboarded(); setShow(false); };

  const features = [
    { icon: BarChart3, text: 'Log trades with detailed metrics & emotions' },
    { icon: BarChart3, text: 'Analyze patterns with 15+ chart types' },
    { icon: CalendarDays, text: 'Review daily performance on the calendar' },
    { icon: BookOpen, text: 'Journal your thoughts & build playbooks' },
    { icon: Link2, text: 'Connect your broker to auto-import trades' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-bold gold-text tracking-tight">Penfoldfx</span>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
        </div>

        <h2 className="text-lg font-semibold mb-2">Welcome to your Trading Journal</h2>
        <p className="text-sm text-muted-foreground mb-6">Track every trade, analyze your performance, and become a consistently profitable trader.</p>

        <div className="space-y-3 mb-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <f.icon size={14} className="text-primary" />
              </div>
              <span className="text-muted-foreground">{f.text}</span>
            </div>
          ))}
        </div>

        <button onClick={handleClose} className="w-full py-3 rounded-xl gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
          Get Started
        </button>
        <p className="text-[11px] text-muted-foreground text-center mt-3">Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">N</kbd> anytime to log a new trade</p>
      </div>
    </div>
  );
}
