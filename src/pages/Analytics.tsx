import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const COLORS = ['hsl(142,71%,45%)', 'hsl(0,72%,51%)', 'hsl(220,10%,50%)'];
const PAIR_COLORS = ['hsl(43,74%,49%)', 'hsl(200,70%,50%)', 'hsl(142,71%,45%)', 'hsl(0,72%,55%)', 'hsl(280,60%,60%)', 'hsl(30,80%,55%)', 'hsl(170,60%,45%)', 'hsl(340,70%,55%)'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { trades } = useApp();

  const data = useMemo(() => {
    if (!trades.length) return null;
    const wins = trades.filter(t => t.result === 'Win').length;
    const losses = trades.filter(t => t.result === 'Loss').length;
    const be = trades.filter(t => t.result === 'Breakeven').length;
    const donut = [{ name: 'Win', value: wins }, { name: 'Loss', value: losses }, { name: 'BE', value: be }];

    // P&L by pair
    const byPair: Record<string, number> = {};
    trades.forEach(t => { byPair[t.pair] = (byPair[t.pair] || 0) + t.pnl; });
    const pairData = Object.entries(byPair).map(([pair, pnl]) => ({ pair, pnl: +pnl.toFixed(2) })).sort((a, b) => b.pnl - a.pnl);

    // Monthly P&L
    const byMonth: Record<string, number> = {};
    trades.forEach(t => { const m = format(new Date(t.date), 'yyyy-MM'); byMonth[m] = (byMonth[m] || 0) + t.pnl; });
    const monthlyData = Object.entries(byMonth).sort().map(([m, pnl]) => ({ month: m, pnl: +pnl.toFixed(2) }));

    // By day of week
    const byDow: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
    trades.forEach(t => { const d = format(new Date(t.date), 'EEE'); if (byDow[d] !== undefined) byDow[d] += t.pnl; });
    const dowData = Object.entries(byDow).map(([day, pnl]) => ({ day, pnl: +pnl.toFixed(2) }));

    // By strategy
    const byStrat: Record<string, number> = {};
    trades.forEach(t => { byStrat[t.strategy] = (byStrat[t.strategy] || 0) + t.pnl; });
    const stratData = Object.entries(byStrat).map(([s, pnl]) => ({ strategy: s, pnl: +pnl.toFixed(2) })).sort((a, b) => b.pnl - a.pnl);

    // By emotion
    const byEmotion: Record<number, { pnl: number; count: number }> = {};
    trades.forEach(t => { if (!byEmotion[t.emotion]) byEmotion[t.emotion] = { pnl: 0, count: 0 }; byEmotion[t.emotion].pnl += t.pnl; byEmotion[t.emotion].count++; });
    const emotionData = [1, 2, 3, 4, 5].map(e => ({ emotion: ['😡', '😟', '😐', '🙂', '😎'][e - 1], pnl: +(byEmotion[e]?.pnl || 0).toFixed(2) }));

    // Mistakes
    const mistakeCount: Record<string, number> = {};
    trades.forEach(t => t.mistakes.forEach(m => { mistakeCount[m] = (mistakeCount[m] || 0) + 1; }));
    const mistakeData = Object.entries(mistakeCount).map(([m, c]) => ({ mistake: m, count: c })).sort((a, b) => b.count - a.count);

    // Most traded pairs
    const pairCount: Record<string, number> = {};
    trades.forEach(t => { pairCount[t.pair] = (pairCount[t.pair] || 0) + 1; });
    const mostTraded = Object.entries(pairCount).map(([pair, count]) => ({ pair, count })).sort((a, b) => b.count - a.count);

    return { donut, pairData, monthlyData, dowData, stratData, emotionData, mistakeData, mostTraded };
  }, [trades]);

  if (!data) return <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">No trade data for analytics.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ChartCard title="Win / Loss / BE">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.donut} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {data.donut.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="P&L by Pair">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.pairData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="pair" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="pnl" fill="hsl(43,74%,49%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly P&L">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {data.monthlyData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'hsl(142,71%,45%)' : 'hsl(0,72%,51%)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="P&L by Day of Week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {data.dowData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'hsl(142,71%,45%)' : 'hsl(0,72%,51%)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="P&L by Strategy">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.stratData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="strategy" tick={{ fontSize: 9 }} width={90} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                {data.stratData.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'hsl(142,71%,45%)' : 'hsl(0,72%,51%)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="P&L by Emotion">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.emotionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="emotion" tick={{ fontSize: 16 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="pnl" fill="hsl(43,74%,49%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Traded Pairs">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.mostTraded} cx="50%" cy="50%" outerRadius={80} dataKey="count" label={({ pair, count }) => `${pair}: ${count}`}>
                {data.mostTraded.map((_, i) => <Cell key={i} fill={PAIR_COLORS[i % PAIR_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mistake Frequency">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.mistakeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="mistake" tick={{ fontSize: 9 }} width={90} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
