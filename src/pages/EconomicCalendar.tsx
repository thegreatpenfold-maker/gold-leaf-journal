import { useState, useMemo } from 'react';

const MOCK_EVENTS = [
  { date: '2026-03-27', time: '08:30', currency: 'USD', event: 'GDP (QoQ)', impact: 'High', forecast: '2.4%', previous: '2.1%' },
  { date: '2026-03-27', time: '10:00', currency: 'USD', event: 'Consumer Confidence', impact: 'High', forecast: '104.5', previous: '102.9' },
  { date: '2026-03-27', time: '14:00', currency: 'GBP', event: 'BOE Interest Rate Decision', impact: 'High', forecast: '4.50%', previous: '4.50%' },
  { date: '2026-03-28', time: '08:30', currency: 'USD', event: 'Core PCE Price Index (MoM)', impact: 'High', forecast: '0.3%', previous: '0.4%' },
  { date: '2026-03-28', time: '09:45', currency: 'USD', event: 'Chicago PMI', impact: 'Medium', forecast: '45.5', previous: '43.6' },
  { date: '2026-03-28', time: '07:00', currency: 'EUR', event: 'German CPI (MoM)', impact: 'High', forecast: '0.4%', previous: '0.5%' },
  { date: '2026-03-31', time: '09:00', currency: 'EUR', event: 'CPI (YoY)', impact: 'High', forecast: '2.5%', previous: '2.6%' },
  { date: '2026-03-31', time: '10:00', currency: 'GBP', event: 'GDP (QoQ)', impact: 'High', forecast: '0.1%', previous: '0.0%' },
  { date: '2026-04-01', time: '10:00', currency: 'USD', event: 'ISM Manufacturing PMI', impact: 'High', forecast: '50.5', previous: '50.3' },
  { date: '2026-04-01', time: '14:00', currency: 'AUD', event: 'RBA Interest Rate Decision', impact: 'High', forecast: '4.10%', previous: '4.10%' },
  { date: '2026-04-02', time: '08:15', currency: 'USD', event: 'ADP Nonfarm Employment', impact: 'High', forecast: '148K', previous: '140K' },
  { date: '2026-04-02', time: '10:00', currency: 'USD', event: 'JOLTS Job Openings', impact: 'Medium', forecast: '8.8M', previous: '8.9M' },
  { date: '2026-04-03', time: '08:30', currency: 'USD', event: 'Initial Jobless Claims', impact: 'Medium', forecast: '225K', previous: '220K' },
  { date: '2026-04-03', time: '10:00', currency: 'USD', event: 'ISM Services PMI', impact: 'High', forecast: '52.5', previous: '52.6' },
  { date: '2026-04-04', time: '08:30', currency: 'USD', event: 'Nonfarm Payrolls', impact: 'High', forecast: '200K', previous: '151K' },
  { date: '2026-04-04', time: '08:30', currency: 'USD', event: 'Unemployment Rate', impact: 'High', forecast: '4.0%', previous: '4.1%' },
  { date: '2026-04-04', time: '08:30', currency: 'CAD', event: 'Employment Change', impact: 'High', forecast: '20.0K', previous: '1.1K' },
  { date: '2026-04-07', time: '07:00', currency: 'JPY', event: 'BOJ Summary of Opinions', impact: 'Medium', forecast: '-', previous: '-' },
  { date: '2026-04-09', time: '14:00', currency: 'USD', event: 'FOMC Meeting Minutes', impact: 'High', forecast: '-', previous: '-' },
  { date: '2026-04-10', time: '08:30', currency: 'USD', event: 'CPI (MoM)', impact: 'High', forecast: '0.3%', previous: '0.2%' },
];

export default function EconomicCalendar() {
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterImpact, setFilterImpact] = useState('');

  const currencies = useMemo(() => [...new Set(MOCK_EVENTS.map(e => e.currency))], []);

  const filtered = useMemo(() => {
    let r = [...MOCK_EVENTS];
    if (filterCurrency) r = r.filter(e => e.currency === filterCurrency);
    if (filterImpact) r = r.filter(e => e.impact === filterImpact);
    return r;
  }, [filterCurrency, filterImpact]);

  const impactColor = (i: string) => i === 'High' ? 'bg-destructive/20 text-destructive' : i === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Economic Calendar</h1>
      <div className="flex gap-3">
        <select value={filterCurrency} onChange={e => setFilterCurrency(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm">
          <option value="">All Currencies</option>
          {currencies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterImpact} onChange={e => setFilterImpact(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm">
          <option value="">All Impact</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
            <th className="p-3 text-left">Date</th><th className="p-3 text-left">Time</th><th className="p-3 text-left">Currency</th>
            <th className="p-3 text-left">Event</th><th className="p-3 text-center">Impact</th><th className="p-3 text-right">Forecast</th><th className="p-3 text-right">Previous</th>
          </tr></thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-3 font-mono text-muted-foreground">{e.date}</td>
                <td className="p-3 font-mono">{e.time}</td>
                <td className="p-3 font-bold">{e.currency}</td>
                <td className="p-3">{e.event}</td>
                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${impactColor(e.impact)}`}>{e.impact}</span></td>
                <td className="p-3 text-right font-mono">{e.forecast}</td>
                <td className="p-3 text-right font-mono text-muted-foreground">{e.previous}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
