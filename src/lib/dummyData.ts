import { Trade } from './types';

export function generateDummyTrades(count = 50): Trade[] {
  const pairs = ['EUR/USD','GBP/USD','USD/JPY','AUD/USD','USD/CAD','GBP/JPY','EUR/GBP','XAU/USD'];
  const strategies = ['Breakout','Trend Follow','Reversal','Scalp','ICT/SMC','Support & Resistance'];
  const mistakes = ['FOMO','Revenge Trade','Early Exit','Late Entry','Overleverage','Moved SL','No Setup'];
  const results: ('Win'|'Loss'|'Breakeven')[] = ['Win','Win','Win','Loss','Loss','Breakeven'];
  const trades: Trade[] = [];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    date.setHours(Math.floor(Math.random() * 14) + 6, Math.floor(Math.random() * 60));
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const direction = Math.random() > 0.5 ? 'Long' as const : 'Short' as const;
    const result = results[Math.floor(Math.random() * results.length)];
    const pnl = result === 'Win' ? +(Math.random() * 500 + 20).toFixed(2) : result === 'Loss' ? -(Math.random() * 300 + 10).toFixed(2) as unknown as number : 0;
    const rr = result === 'Win' ? +(Math.random() * 3 + 0.5).toFixed(2) : result === 'Loss' ? -1 : 0;
    const entry = pair.includes('JPY') ? +(140 + Math.random() * 20).toFixed(3) : pair === 'XAU/USD' ? +(1900 + Math.random() * 200).toFixed(2) : +(1 + Math.random() * 0.5).toFixed(5);
    const sl = direction === 'Long' ? +(entry * 0.998).toFixed(5) : +(entry * 1.002).toFixed(5);
    const tp = direction === 'Long' ? +(entry * 1.004).toFixed(5) : +(entry * 0.996).toFixed(5);
    const numMistakes = Math.random() > 0.6 ? Math.floor(Math.random() * 2) + 1 : 0;
    const tradeMistakes: string[] = [];
    for (let j = 0; j < numMistakes; j++) tradeMistakes.push(mistakes[Math.floor(Math.random() * mistakes.length)]);

    trades.push({
      id: crypto.randomUUID(),
      date: date.toISOString(),
      pair, direction, entry, sl, tp,
      lotSize: [0.01, 0.02, 0.05, 0.1, 0.5, 1.0][Math.floor(Math.random() * 6)],
      result, pnl: +pnl, rr,
      commission: +(Math.random() * 5 + 1).toFixed(2),
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      emotion: Math.floor(Math.random() * 5) + 1,
      confidence: Math.floor(Math.random() * 5) + 1,
      notes: '',
      mistakes: tradeMistakes,
    });
  }

  return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
