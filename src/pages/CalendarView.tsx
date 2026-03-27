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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendar</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-medium text-sm min-w-[140px] text-center">{format(current, 'MMMM yyyy')}</span>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Month Stats Bar */}
      <div className="flex items-center gap-6 text-sm bg-card border border-border rounded-xl px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] uppercase tracking-wide">P&L</span>
          <span className={`font-semibold font-mono ${monthPnl >= 0 ? 'text-success' : 'text-destructive'}`}>{monthPnl >= 0 ? '+' : ''}{monthPnl.toFixed(2)}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Trades</span>
          <span className="font-semibold">{monthTrades.length}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Win Rate</span>
          <span className="font-semibold">{monthWR}%</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[11px] text-muted-foreground font-medium py-2.5">{d}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`e${i}`} className="border-b border-r border-border min-h-[80px]" />
          ))}
          {days.map((day, idx) => {
            const key = format(day, 'yyyy-MM-dd');
            const dt = tradesByDay[key];
            const pnl = dt?.reduce((s, t) => s + t.pnl, 0) || 0;
            const count = dt?.length || 0;
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());
            const cellIdx = startDow + idx;
            const isLastRow = cellIdx >= (Math.ceil((startDow + days.length) / 7) - 1) * 7;

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(day)}
                className={`text-left min-h-[80px] p-2.5 border-r border-b border-border transition-colors relative
                  ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'}
                  ${isLastRow ? 'border-b-0' : ''}
                  ${(cellIdx + 1) % 7 === 0 ? 'border-r-0' : ''}
                `}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? 'w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </div>
                {count > 0 && (
                  <div className="space-y-0.5">
                    <div className={`text-[11px] font-mono font-semibold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{count} trade{count > 1 ? 's' : ''}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail */}
      {selectedDay && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h3>
            <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
          </div>
          {selectedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trades on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedTrades.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-xs">
                  <span className="font-semibold">{t.pair}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.direction === 'Long' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{t.direction === 'Long' ? 'BUY' : 'SELL'}</span>
                  <span className={`font-mono font-semibold ${t.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>{t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}</span>
                  <span className="text-muted-foreground">{t.strategy}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t.result === 'Win' ? 'bg-success/10 text-success' : t.result === 'Loss' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{t.result}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
