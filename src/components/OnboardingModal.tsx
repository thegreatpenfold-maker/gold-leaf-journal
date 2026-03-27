import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TrendingUp, X } from 'lucide-react';

export default function OnboardingModal() {
  const { onboarded, setOnboarded } = useApp();
  const [show, setShow] = useState(!onboarded);

  if (!show) return null;

  const handleClose = () => { setOnboarded(); setShow(false); };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 space-y-5 glow-gold">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gold-text">ForexPro</span>
          </div>
          <button onClick={handleClose}><X size={18} className="text-muted-foreground" /></button>
        </div>
        <h2 className="text-xl font-bold">Welcome to your Trading Journal</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Track every trade, analyze your performance, and become a consistently profitable trader. ForexPro helps you:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>📊 Log trades with detailed metrics & emotions</li>
          <li>📈 Analyze patterns with 15+ chart types</li>
          <li>📅 Review daily performance on the calendar</li>
          <li>📖 Journal your thoughts & build playbooks</li>
          <li>🔗 Connect your broker to auto-import trades</li>
          <li>⌨️ Use keyboard shortcuts: N=New Trade, D=Dashboard</li>
        </ul>
        <button onClick={handleClose} className="w-full py-3 rounded-xl gold-gradient text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </div>
    </div>
  );
}
