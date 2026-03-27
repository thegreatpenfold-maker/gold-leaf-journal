import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { Search, Trash2, Download, Filter, ArrowUpDown } from 'lucide-react';
import { EMOTIONS } from '@/lib/types';
import { toast } from 'sonner';

type SortKey = 'date' | 'pair' | 'pnl' | 'rr' | 'result';
type SortDir = 'asc' | 'desc';

export default function TradeLog() {
  const { trades, deleteTrades } = useApp();
  const [search, setSearch] = useState('');
  const [filterPair, setFilterPair] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const pairs = useMemo(() => [...new Set(trades.map(t => t.pair))], [trades]);
  const strategies = useMemo(() => [...new Set(trades.map(t => t.strategy))], [trades]);

  const filtered = useMemo(() => {
    let result = [...trades];
    if (search) result = result.filter(t => t.pair.toLowerCase().includes(search.toLowerCase()) || t.notes.toLowerCase().includes(search.toLowerCase()) || t.strategy.toLowerCase().includes(search.toLowerCase()));
    if (filterPair) result = result.filter(t => t.pair === filterPair);
    if (filterStrategy) result = result.filter(t => t.strategy === filterStrategy);
    if (filterResult) result = result.filter(t => t.result === filterResult);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === 'pair') cmp = a.pair.localeCompare(b.pair);
      else if (sortKey === 'pnl') cmp = a.pnl - b.pnl;
      else if (sortKey === 'rr') cmp = a.rr - b.rr;
      else if (sortKey === 'result') cmp = a.result.localeCompare(b.result);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [trades, search, filterPair, filterStrategy, filterResult, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    deleteTrades([...selected]);
    setSelected(new Set());
    toast.success(`Deleted ${selected.size} trades`);
  };

  const exportCSV = () => {
    const headers = ['Date','Pair','Direction','Entry','SL','TP','Lot Size','Result','P&L','R:R','Commission','Strategy','Emotion','Confidence','Notes'];
    const rows = filtered.map(t => [format(new Date(t.date), 'yyyy-MM-dd HH:mm'), t.pair, t.direction, t.entry, t.sl, t.tp, t.lotSize, t.result, t.pnl, t.rr, t.commission, t.strategy, t.emotion, t.confidence, `"${t.notes}"`]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'trades.csv'; a.click();
    toast.success('CSV exported');
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {label} <ArrowUpDown size={10} className={sortKey === k ? 'text-primary' : 'opacity-30'} />
    </button>
  );

  const selectCls = "px-3 py-1.5 rounded-lg bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Trade Log</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 rounded-lg bg-muted border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary w-44" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-1.5 rounded-lg border transition-colors ${showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}><Filter size={14} /></button>
          <button onClick={exportCSV} className="p-1.5 rounded-lg border border-border hover:border-primary/30 transition-colors"><Download size={14} /></button>
          {selected.size > 0 && <button onClick={handleBulkDelete} className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"><Trash2 size={14} /></button>}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <select value={filterPair} onChange={e => setFilterPair(e.target.value)} className={selectCls}>
            <option value="">All Pairs</option>
            {pairs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStrategy} onChange={e => setFilterStrategy(e.target.value)} className={selectCls}>
            <option value="">All Strategies</option>
            {strategies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterResult} onChange={e => setFilterResult(e.target.value)} className={selectCls}>
            <option value="">All Results</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Breakeven">Breakeven</option>
          </select>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] text-muted-foreground">
                <th className="p-3 text-left"><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(t => t.id)) : new Set())} checked={selected.size === filtered.length && filtered.length > 0} className="accent-primary" /></th>
                <th className="p-3 text-left"><SortBtn k="date" label="Date" /></th>
                <th className="p-3 text-left"><SortBtn k="pair" label="Pair" /></th>
                <th className="p-3 text-left">Dir</th>
                <th className="p-3 text-right">Entry</th>
                <th className="p-3 text-right">SL</th>
                <th className="p-3 text-right">TP</th>
                <th className="p-3 text-right">Lots</th>
                <th className="p-3 text-left"><SortBtn k="result" label="Result" /></th>
                <th className="p-3 text-right"><SortBtn k="pnl" label="P&L" /></th>
                <th className="p-3 text-right"><SortBtn k="rr" label="R:R" /></th>
                <th className="p-3 text-right">Comm</th>
                <th className="p-3 text-left">Strategy</th>
                <th className="p-3 text-center">😊</th>
                <th className="p-3 text-center">💪</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                  <td className="p-3"><input type="checkbox" checked={selected.has(t.id)} onChange={e => { const s = new Set(selected); e.target.checked ? s.add(t.id) : s.delete(t.id); setSelected(s); }} className="accent-primary" /></td>
                  <td className="p-3 font-mono text-muted-foreground">{format(new Date(t.date), 'MM/dd HH:mm')}</td>
                  <td className="p-3 font-medium">{t.pair}</td>
                  <td className="p-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.direction === 'Long' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{t.direction === 'Long' ? 'BUY' : 'SELL'}</span></td>
                  <td className="p-3 text-right font-mono">{t.entry}</td>
                  <td className="p-3 text-right font-mono text-destructive/60">{t.sl}</td>
                  <td className="p-3 text-right font-mono text-success/60">{t.tp}</td>
                  <td className="p-3 text-right font-mono">{t.lotSize}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${t.result === 'Win' ? 'bg-success/10 text-success' : t.result === 'Loss' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{t.result}</span></td>
                  <td className={`p-3 text-right font-mono font-semibold ${t.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>{t.pnl >= 0 ? '+' : ''}{t.pnl.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">{t.rr.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono text-muted-foreground">-{t.commission.toFixed(2)}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{t.strategy}</span></td>
                  <td className="p-3 text-center">{EMOTIONS[t.emotion - 1]}</td>
                  <td className="p-3 text-center text-muted-foreground">{t.confidence}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">No trades found</div>}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{filtered.length} trades</p>
    </div>
  );
}
