import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Target, Flame, Award, AlertTriangle, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MARKET_SESSIONS, EMOTIONS } from '@/lib/types';
import { format } from 'date-fns';

function KPICard({ label, value, icon: Icon, color = 'text-foreground', sub }: { label: string; value: string | number; icon: any; color?: string; sub?: string }) {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color} font-mono`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { trades, settings } = useApp();

  const stats = useMemo(() => {
    if (!trades.length) return null;
    const wins = trades.filter(t => t.result === 'Win');
    const losses = trades.filter(t => t.result === 'Loss');
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const totalComm = trades.reduce((s, t) => s + t.commission, 0);
    const winRate = (wins.length / trades.length) * 100;
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const avgRR = trades.reduce((s, t) => s + t.rr, 0) / trades.length;
    const profitFactor = Math.abs(avgLoss) > 0 ? (wins.reduce((s, t) => s + t.pnl, 0)) / Math.abs(losses.reduce((s, t) => s + t.pnl, 0)) : 0;

    // Drawdown
    let peak = 0, maxDD = 0, running = 0;
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (const t of sorted) {
      running += t.pnl;
      if (running > peak) peak = running;
      const dd = peak - running;
      if (dd > maxDD) maxDD = dd;
    }

    // By day
    const byDay: Record<string, number> = {};
    trades.forEach(t => { const d = format(new Date(t.date), 'yyyy-MM-dd'); byDay[d] = (byDay[d] || 0) + t.pnl; });
    const days = Object.entries(byDay);
    const bestDay = days.reduce((b, d) => d[1] > b[1] ? d : b, ['', -Infinity]);
    const worstDay = days.reduce((w, d) => d[1] < w[1] ? d : w, ['', Infinity]);

    const largestWin = wins.length ? Math.max(...wins.map(t => t.pnl)) : 0;
    const largestLoss = losses.length ? Math.min(...losses.map(t => t.pnl)) : 0;

    // Equity curve
    let eq = 0;
    const equityCurve = sorted.map(t => { eq += t.pnl; return { date: format(new Date(t.date), 'MM/dd'), equity: +eq.toFixed(2) }; });

    // Today
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTrades = trades.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === today);
    const todayPnl = todayTrades.reduce((s, t) => s + t.pnl, 0);

    // Streak
    const sortedDesc = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0, sType: 'win' | 'loss' | null = null;
    for (const t of sortedDesc) {
      if (t.result === 'Breakeven') continue;
      if (!sType) { sType = t.result === 'Win' ? 'win' : 'loss'; streak = 1; }
      else if ((t.result === 'Win' && sType === 'win') || (t.result === 'Loss' && sType === 'loss')) streak++;
      else break;
    }

    return {
      total: trades.length, winRate, totalPnl, avgRR, profitFactor, maxDD, avgWin, avgLoss,
      largestWin, largestLoss, totalComm, bestDay, worstDay, equityCurve,
      todayTrades: todayTrades.length, todayPnl, streak, streakType: sType,
    };
  }, [trades]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BarChart3 className="w-16 h-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold text-muted-foreground">No trades yet</h2>
        <p className="text-sm text-muted-foreground">Add your first trade to see your dashboard come alive.</p>
      </div>
    );
  }

  const cur = settings.currency;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {stats.streak > 0 && (
          <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
            {stats.streakType === 'win' && <Flame className="w-5 h-5 text-warning" />}
            <span className={`font-bold ${stats.streakType === 'win' ? 'text-success' : 'text-destructive'}`}>
              {stats.streak} {stats.streakType === 'win' ? 'Win' : 'Loss'} Streak {stats.streakType === 'win' ? '🔥' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Today Summary */}
      <div className="glass-card rounded-xl p-4 flex items-center gap-6 gold-gradient/10 border-primary/20">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Today's Summary</p>
          <p className="text-lg font-bold font-mono">
            <span className={stats.todayPnl >= 0 ? 'text-success' : 'text-destructive'}>
              {stats.todayPnl >= 0 ? '+' : ''}{stats.todayPnl.toFixed(2)} {cur}
            </span>
          </p>
        </div>
        <div className="text-sm text-muted-foreground">{stats.todayTrades} trades today</div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <KPICard label="Total Trades" value={stats.total} icon={BarChart3} />
        <KPICard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={Percent} color={stats.winRate >= 50 ? 'text-success' : 'text-destructive'} />
        <KPICard label="Total P&L" value={`${stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}`} icon={DollarSign} color={stats.totalPnl >= 0 ? 'text-success' : 'text-destructive'} />
        <KPICard label="Avg R:R" value={stats.avgRR.toFixed(2)} icon={Target} />
        <KPICard label="Profit Factor" value={stats.profitFactor.toFixed(2)} icon={TrendingUp} color={stats.profitFactor >= 1 ? 'text-success' : 'text-destructive'} />
        <KPICard label="Max Drawdown" value={`-${stats.maxDD.toFixed(2)}`} icon={TrendingDown} color="text-destructive" />
        <KPICard label="Avg Win" value={`+${stats.avgWin.toFixed(2)}`} icon={Award} color="text-success" />
        <KPICard label="Avg Loss" value={stats.avgLoss.toFixed(2)} icon={AlertTriangle} color="text-destructive" />
        <KPICard label="Largest Win" value={`+${stats.largestWin.toFixed(2)}`} icon={TrendingUp} color="text-success" />
        <KPICard label="Largest Loss" value={stats.largestLoss.toFixed(2)} icon={TrendingDown} color="text-destructive" />
        <KPICard label="Commissions" value={`-${stats.totalComm.toFixed(2)}`} icon={DollarSign} color="text-muted-foreground" />
        <KPICard label="Best Day" value={`+${stats.bestDay[1].toFixed(2)}`} icon={Award} color="text-success" sub={stats.bestDay[0]} />
        <KPICard label="Worst Day" value={stats.worstDay[1].toFixed(2)} icon={AlertTriangle} color="text-destructive" sub={stats.worstDay[0]} />
      </div>

      {/* Equity Curve */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.equityCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="equity" stroke="hsl(43, 74%, 49%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Market Sessions */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Market Sessions</h3>
        <MarketSessionsClock />
      </div>
    </div>
  );
}

function MarketSessionsClock() {
  const now = new Date();
  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {MARKET_SESSIONS.map(s => {
        const isOpen = s.open < s.close
          ? utcH >= s.open && utcH < s.close
          : utcH >= s.open || utcH < s.close;

        let nextEvent: string;
        let hoursTo: number;
        if (isOpen) {
          hoursTo = s.open < s.close ? s.close - utcH : (utcH >= s.open ? (24 - utcH + s.close) : s.close - utcH);
          nextEvent = `Closes in ~${hoursTo}h`;
        } else {
          hoursTo = utcH < s.open ? s.open - utcH : 24 - utcH + s.open;
          nextEvent = `Opens in ~${hoursTo}h`;
        }

        return (
          <div key={s.name} className={`rounded-xl p-4 border ${isOpen ? 'border-success/30 bg-success/5' : 'border-border bg-card'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-success animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className="font-semibold text-sm">{s.name}</span>
            </div>
            <p className={`text-xs ${isOpen ? 'text-success' : 'text-muted-foreground'}`}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{nextEvent}</p>
          </div>
        );
      })}
    </div>
  );
}
