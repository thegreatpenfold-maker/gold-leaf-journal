import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CalendarView() {
  const { trades } = useApp();
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) }), [current]);
  const startDow = startOfMonth(current).getDay();

  const tradesByDay = useMemo(() => {
    const map: Record<string, typeof trades> = {};
    trades.forEach(t => {
      const d = format(new Date(t.date), 'yyyy-MM-dd');
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [trades]);

  const monthTrades = trades.filter(t => isSameMonth(new Date(t.date), current));
  const monthPnl = monthTrades.reduce((s, t) => s + t.pnl, 0);
  const monthWins = monthTrades.filter(t => t.result === 'Win').length;
  const monthWR = monthTrades.length ? ((monthWins / monthTrades.length) * 100).toFixed(1) : '0';

  const selectedTrades = selectedDay ? tradesByDay[format(selectedDay, 'yyyy-MM-dd')] || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-semibold text-lg min-w-[140px] text-center">{format(current, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dt = tradesByDay[key];
            const pnl = dt?.reduce((s, t) => s + t.pnl, 0) || 0;
            const count = dt?.length || 0;
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());
            return (
              <button key={key} onClick={() => setSelectedDay(day)}
                className={`p-2 rounded-lg text-left min-h-[70px] transition-all text-xs ${isSelected ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted/50'} ${isToday ? 'border border-primary/30' : 'border border-transparent'}`}
              >
                <div className={`font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>{format(day, 'd')}</div>
                {count > 0 && (
                  <>
                    <div className={`font-mono font-bold text-[10px] ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
                    </div>
                    <div className="text-[9px] text-muted-foreground">{count} trade{count > 1 ? 's' : ''}</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month summary */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap gap-6 text-sm">
        <div><span className="text-muted-foreground text-xs">Month P&L:</span> <span className={`font-bold font-mono ${monthPnl >= 0 ? 'text-success' : 'text-destructive'}`}>{monthPnl >= 0 ? '+' : ''}{monthPnl.toFixed(2)}</span></div>
        <div><span className="text-muted-foreground text-xs">Trades:</span> <span className="font-bold">{monthTrades.length}</span></div>
        <div><span className="text-muted-foreground text-xs">Win Rate:</span> <span className="font-bold">{monthWR}%</span></div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h3>
            <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
          </div>
          {selectedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trades on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedTrades.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 text-xs">
                  <span className="font-semibold">{t.pair}</span>
                  <span className={t.direction === 'Long' ? 'text-success' : 'text-destructive'}>{t.direction}</span>
                  <span className={`font-mono font-bold ${t.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>{t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}</span>
                  <span className="text-muted-foreground">{t.strategy}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.result === 'Win' ? 'bg-success/10 text-success' : t.result === 'Loss' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{t.result}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
