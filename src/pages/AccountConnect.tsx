import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BROKERS, ConnectedAccount } from '@/lib/types';
import { generateDummyTrades } from '@/lib/dummyData';
import { Link2, Unlink, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountConnect() {
  const { accounts, addAccount, removeAccount, addTrade, trades } = useApp();
  const [broker, setBroker] = useState(BROKERS[0]);
  const [accountId, setAccountId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [secret, setSecret] = useState('');

  const handleConnect = () => {
    if (!accountId.trim()) { toast.error('Account ID required'); return; }
    const newAcc: ConnectedAccount = {
      id: crypto.randomUUID(), broker, accountId, apiKey, secret, status: 'connected',
      balance: +(10000 + Math.random() * 90000).toFixed(2),
      equity: +(10000 + Math.random() * 90000).toFixed(2),
      openTrades: Math.floor(Math.random() * 5),
      dailyPnl: +((Math.random() - 0.4) * 500).toFixed(2),
      lastSync: new Date().toISOString(),
    };
    addAccount(newAcc);
    setAccountId(''); setApiKey(''); setSecret('');
    toast.success(`Connected to ${broker}`);
  };

  const handleSync = () => {
    if (trades.length > 0) { toast.info('Trades already synced'); return; }
    const dummy = generateDummyTrades(50);
    dummy.forEach(t => addTrade(t));
    toast.success('Synced 50 trades from broker');
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Account Connect</h1>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Connect Broker</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Broker</label>
            <select value={broker} onChange={e => setBroker(e.target.value)} className={inputCls}>
              {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div><label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Account ID</label><input value={accountId} onChange={e => setAccountId(e.target.value)} className={inputCls} placeholder="e.g. 12345678" /></div>
          <div><label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">API Key</label><input value={apiKey} onChange={e => setApiKey(e.target.value)} className={inputCls} placeholder="Optional" /></div>
          <div><label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Secret</label><input type="password" value={secret} onChange={e => setSecret(e.target.value)} className={inputCls} placeholder="Optional" /></div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleConnect} className="flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-primary-foreground font-semibold text-xs"><Link2 size={13} /> Connect</button>
          <button onClick={handleSync} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-colors"><RefreshCw size={13} /> Sync Trades (Demo)</button>
        </div>
      </div>

      {accounts.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-[11px] text-muted-foreground">
              <th className="p-3 text-left font-medium">Broker</th><th className="p-3 text-left font-medium">Account</th><th className="p-3 text-center font-medium">Status</th>
              <th className="p-3 text-right font-medium">Balance</th><th className="p-3 text-right font-medium">Equity</th><th className="p-3 text-right font-medium">Open</th>
              <th className="p-3 text-right font-medium">Daily P&L</th><th className="p-3 text-left font-medium">Last Sync</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="p-3 font-medium">{a.broker}</td>
                  <td className="p-3 font-mono">{a.accountId}</td>
                  <td className="p-3 text-center">{a.status === 'connected' ? <Wifi size={13} className="text-success inline" /> : <WifiOff size={13} className="text-destructive inline" />}</td>
                  <td className="p-3 text-right font-mono">${a.balance.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono">${a.equity.toLocaleString()}</td>
                  <td className="p-3 text-right">{a.openTrades}</td>
                  <td className={`p-3 text-right font-mono font-semibold ${a.dailyPnl >= 0 ? 'text-success' : 'text-destructive'}`}>{a.dailyPnl >= 0 ? '+' : ''}{a.dailyPnl.toFixed(2)}</td>
                  <td className="p-3 text-[10px] text-muted-foreground">{new Date(a.lastSync).toLocaleString()}</td>
                  <td className="p-3"><button onClick={() => { removeAccount(a.id); toast.success('Disconnected'); }} className="text-destructive hover:underline text-[10px]"><Unlink size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
