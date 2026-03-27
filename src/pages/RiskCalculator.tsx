import { useState, useMemo } from 'react';
import { FOREX_PAIRS } from '@/lib/types';
import { Calculator } from 'lucide-react';

export default function RiskCalculator() {
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [pair, setPair] = useState('EUR/USD');

  const calc = useMemo(() => {
    const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
    const dollarRisk = balance * (riskPct / 100);
    const pipDiff = e && s ? Math.abs(e - s) : 0;
    const isJPY = pair.includes('JPY');
    const pipSize = isJPY ? 0.01 : 0.0001;
    const pips = pipDiff / pipSize;
    const pipValue = pips > 0 ? dollarRisk / pips : 0;
    const lotSize = pipValue / (isJPY ? 1000 : 10);
    const rr = e && s && t ? Math.abs((t - e) / (e - s)) : 0;

    const table = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map(r => {
      const dr = balance * (r / 100);
      const ls = pips > 0 ? (dr / pips) / (isJPY ? 1000 : 10) : 0;
      return { risk: r, dollarRisk: dr, lotSize: ls };
    });

    return { dollarRisk, pips, pipValue, lotSize, rr, table };
  }, [balance, riskPct, entry, sl, tp, pair]);

  const inputCls = "w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold">Risk Calculator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Inputs</h3>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Balance ($)</label>
            <input type="number" value={balance} onChange={e => setBalance(+e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Risk: {riskPct}%</label>
            <input type="range" min="0.25" max="10" step="0.25" value={riskPct} onChange={e => setRiskPct(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Pair</label>
            <select value={pair} onChange={e => setPair(e.target.value)} className={inputCls}>{FOREX_PAIRS.map(p => <option key={p} value={p}>{p}</option>)}</select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Entry</label><input type="number" step="any" value={entry} onChange={e => setEntry(e.target.value)} className={inputCls} /></div>
            <div><label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">SL</label><input type="number" step="any" value={sl} onChange={e => setSl(e.target.value)} className={inputCls} /></div>
            <div><label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">TP</label><input type="number" step="any" value={tp} onChange={e => setTp(e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Results</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Dollar Risk', value: `$${calc.dollarRisk.toFixed(2)}`, highlight: true },
              { label: 'Lot Size', value: calc.lotSize.toFixed(2) },
              { label: 'Pips at Risk', value: calc.pips.toFixed(1) },
              { label: 'R:R', value: calc.rr > 0 ? calc.rr.toFixed(2) : '—' },
            ].map(r => (
              <div key={r.label} className="p-3 rounded-lg bg-muted">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{r.label}</p>
                <p className={`text-lg font-semibold font-mono ${r.highlight ? 'text-primary' : ''}`}>{r.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-4">Position Size Table</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-[11px] text-muted-foreground">
            <th className="py-2 text-left font-medium">Risk %</th><th className="py-2 text-right font-medium">$ Risk</th><th className="py-2 text-right font-medium">Lot Size</th>
          </tr></thead>
          <tbody>
            {calc.table.map(r => (
              <tr key={r.risk} className={`border-b border-border/50 ${r.risk === riskPct ? 'bg-primary/5 font-semibold' : ''}`}>
                <td className="py-2 font-mono text-xs">{r.risk}%</td>
                <td className="py-2 text-right font-mono text-xs">${r.dollarRisk.toFixed(2)}</td>
                <td className="py-2 text-right font-mono text-xs">{r.lotSize.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
