import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FOREX_PAIRS, STRATEGIES, MISTAKES, EMOTIONS } from '@/lib/types';
import { toast } from 'sonner';

export default function AddTrade() {
  const { addTrade, settings } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    closeDate: '',
    pair: 'EUR/USD',
    direction: 'Long' as 'Long' | 'Short',
    entry: '', sl: '', tp: '',
    lotSize: String(settings.defaultLotSize),
    commission: '',
    result: 'Win' as 'Win' | 'Loss' | 'Breakeven',
    pnl: '', emotion: 3, confidence: 3,
    strategy: STRATEGIES[0],
    mistakes: [] as string[],
    notes: '',
  });

  const calcRR = () => {
    const e = parseFloat(form.entry), s = parseFloat(form.sl), t = parseFloat(form.tp);
    if (!e || !s || !t || e === s) return 0;
    return Math.abs((t - e) / (e - s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrade({
      id: crypto.randomUUID(),
      date: new Date(form.date).toISOString(),
      closeDate: form.closeDate ? new Date(form.closeDate).toISOString() : undefined,
      pair: form.pair, direction: form.direction,
      entry: parseFloat(form.entry) || 0, sl: parseFloat(form.sl) || 0, tp: parseFloat(form.tp) || 0,
      lotSize: parseFloat(form.lotSize) || 0.01, result: form.result,
      pnl: parseFloat(form.pnl) || 0, rr: +calcRR().toFixed(2),
      commission: parseFloat(form.commission) || 0,
      strategy: form.strategy, emotion: form.emotion, confidence: form.confidence,
      notes: form.notes, mistakes: form.mistakes,
    });
    toast.success('Trade added');
    navigate('/trades');
  };

  const toggleMistake = (m: string) => setForm(f => ({ ...f, mistakes: f.mistakes.includes(m) ? f.mistakes.filter(x => x !== m) : [...f.mistakes, m] }));
  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const inputCls = "w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors";
  const labelCls = "text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Add Trade</h1>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Open Date & Time</label><input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} required /></div>
          <div><label className={labelCls}>Close Date & Time</label><input type="datetime-local" value={form.closeDate} onChange={e => set('closeDate', e.target.value)} className={inputCls} /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Currency Pair</label>
            <select value={form.pair} onChange={e => set('pair', e.target.value)} className={inputCls}>
              {FOREX_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Direction</label>
            <div className="flex gap-2">
              {(['Long', 'Short'] as const).map(d => (
                <button key={d} type="button" onClick={() => set('direction', d)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${form.direction === d ? (d === 'Long' ? 'bg-success/15 text-success border border-success/20' : 'bg-destructive/15 text-destructive border border-destructive/20') : 'bg-muted border border-border text-muted-foreground'}`}>
                  {d === 'Long' ? '↑ Long' : '↓ Short'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><label className={labelCls}>Entry Price</label><input type="number" step="any" value={form.entry} onChange={e => set('entry', e.target.value)} className={inputCls} required /></div>
          <div><label className={labelCls}>Stop Loss</label><input type="number" step="any" value={form.sl} onChange={e => set('sl', e.target.value)} className={inputCls} required /></div>
          <div><label className={labelCls}>Take Profit</label><input type="number" step="any" value={form.tp} onChange={e => set('tp', e.target.value)} className={inputCls} required /></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div><label className={labelCls}>Lot Size</label><input type="number" step="any" value={form.lotSize} onChange={e => set('lotSize', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Commission</label><input type="number" step="any" value={form.commission} onChange={e => set('commission', e.target.value)} className={inputCls} /></div>
          <div>
            <label className={labelCls}>R:R (auto)</label>
            <div className={`${inputCls} bg-muted/80 font-mono font-semibold text-primary`}>{calcRR().toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Result</label>
            <div className="flex gap-2">
              {(['Win', 'Loss', 'Breakeven'] as const).map(r => (
                <button key={r} type="button" onClick={() => set('result', r)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${form.result === r ? (r === 'Win' ? 'bg-success/15 text-success border border-success/20' : r === 'Loss' ? 'bg-destructive/15 text-destructive border border-destructive/20' : 'bg-muted text-foreground border border-border') : 'bg-muted border border-border text-muted-foreground'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div><label className={labelCls}>P&L ($)</label><input type="number" step="any" value={form.pnl} onChange={e => set('pnl', e.target.value)} className={inputCls} required /></div>
        </div>

        <div>
          <label className={labelCls}>Strategy</label>
          <div className="flex flex-wrap gap-1.5">
            {STRATEGIES.map(s => (
              <button key={s} type="button" onClick={() => set('strategy', s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.strategy === s ? 'bg-primary/15 text-primary border border-primary/20' : 'bg-muted border border-border text-muted-foreground hover:border-primary/20'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Emotion</label>
            <div className="flex gap-1.5">
              {EMOTIONS.map((em, i) => (
                <button key={i} type="button" onClick={() => set('emotion', i + 1)} className={`text-lg p-1.5 rounded-lg transition-all ${form.emotion === i + 1 ? 'bg-primary/15 scale-105 ring-1 ring-primary/30' : 'opacity-35 hover:opacity-60'}`}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Confidence</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(c => (
                <button key={c} type="button" onClick={() => set('confidence', c)} className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${form.confidence === c ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-muted border border-border text-muted-foreground'}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Mistakes Made</label>
          <div className="flex flex-wrap gap-1.5">
            {MISTAKES.map(m => (
              <button key={m} type="button" onClick={() => toggleMistake(m)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.mistakes.includes(m) ? 'bg-destructive/15 text-destructive border border-destructive/20' : 'bg-muted border border-border text-muted-foreground hover:border-destructive/20'}`}>{m}</button>
            ))}
          </div>
        </div>

        <div><label className={labelCls}>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className={inputCls} placeholder="Trade notes..." /></div>

        <button type="submit" className="w-full py-2.5 rounded-xl gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">Save Trade</button>
      </form>
    </div>
  );
}
