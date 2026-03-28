import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BROKERS, ConnectedAccount } from '@/lib/types';
import { generateDummyTrades } from '@/lib/dummyData';
import { Link2, Unlink, RefreshCw, Wifi, WifiOff, Server, Shield, Monitor } from 'lucide-react';
import { toast } from 'sonner';

const MT5_SERVERS = [
  'MetaQuotes-Demo',
  'ICMarkets-Demo',
  'ICMarkets-Live01',
  'ICMarkets-Live02',
  'Pepperstone-Demo',
  'Pepperstone-Live',
  'Exness-Real',
  'Exness-Trial',
  'XM-Real',
  'XM-Demo',
  'FBS-Real',
  'FBS-Demo',
  'FXCM-Demo',
  'OANDA-Demo',
  'OANDA-Live',
  'Alpari-MT5',
  'RoboForex-ECN',
  'HFM-Live',
  'Tickmill-Demo',
  'FPMarkets-Live',
];

export default function AccountConnect() {
  const { accounts, addAccount, removeAccount, addTrade, trades } = useApp();
  const [broker, setBroker] = useState(BROKERS[0]);
  const [server, setServer] = useState(MT5_SERVERS[0]);
  const [customServer, setCustomServer] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!loginId.trim()) { toast.error('Login ID is required'); return; }
    if (!password.trim()) { toast.error('Password is required'); return; }

    setConnecting(true);

    // Simulate connection delay
    await new Promise(r => setTimeout(r, 1500));

    const selectedServer = customServer || server;
    const newAcc: ConnectedAccount = {
      id: crypto.randomUUID(),
      broker,
      accountId: loginId,
      apiKey: '',
      secret: '',
      server: selectedServer,
      status: 'connected',
      balance: +(10000 + Math.random() * 90000).toFixed(2),
      equity: +(10000 + Math.random() * 90000).toFixed(2),
      openTrades: Math.floor(Math.random() * 5),
      dailyPnl: +((Math.random() - 0.4) * 500).toFixed(2),
      lastSync: new Date().toISOString(),
    };

    try {
      await addAccount(newAcc);
      setLoginId('');
      setPassword('');
      setCustomServer('');
      toast.success(`Connected to ${selectedServer}`);
    } catch (err) {
      toast.error('Failed to save connection');
    }
    setConnecting(false);
  };

  const handleSync = async () => {
    if (trades.length > 0) { toast.info('Trades already synced'); return; }
    const dummy = generateDummyTrades(50);
    for (const t of dummy) {
      await addTrade(t);
    }
    toast.success('Synced 50 trades from broker');
  };

  const handleDisconnect = async (id: string) => {
    await removeAccount(id);
    toast.success('Account disconnected');
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Account Connect</h1>

      {/* MT5-style connection panel */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Monitor size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Connect Trading Account</h3>
            <p className="text-[11px] text-muted-foreground">Enter your broker credentials to sync trades</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Broker & Server */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Platform</label>
              <select value={broker} onChange={e => setBroker(e.target.value)} className={inputCls}>
                {BROKERS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">
                <Server size={10} className="inline mr-1" />Server
              </label>
              <select value={server} onChange={e => setServer(e.target.value)} className={inputCls}>
                {MT5_SERVERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Custom server input */}
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Custom Server (optional)</label>
            <input
              value={customServer}
              onChange={e => setCustomServer(e.target.value)}
              className={inputCls}
              placeholder="e.g. MyBroker-Live01"
            />
          </div>

          {/* Login credentials */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Login ID</label>
              <input
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                className={inputCls}
                placeholder="e.g. 51234567"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">
                <Shield size={10} className="inline mr-1" />Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls}
                placeholder="Trading account password"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg gold-gradient text-primary-foreground font-semibold text-xs disabled:opacity-50 transition-opacity"
            >
              {connecting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 size={13} /> Connect Account
                </>
              )}
            </button>
            <button
              onClick={handleSync}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw size={13} /> Sync Trades (Demo)
            </button>
          </div>
        </div>
      </div>

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Connected Accounts</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-[11px] text-muted-foreground">
                <th className="p-3 text-left font-medium">Platform</th>
                <th className="p-3 text-left font-medium">Server</th>
                <th className="p-3 text-left font-medium">Login</th>
                <th className="p-3 text-center font-medium">Status</th>
                <th className="p-3 text-right font-medium">Balance</th>
                <th className="p-3 text-right font-medium">Equity</th>
                <th className="p-3 text-right font-medium">Open</th>
                <th className="p-3 text-right font-medium">Daily P&L</th>
                <th className="p-3 text-left font-medium">Last Sync</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{a.broker}</td>
                  <td className="p-3 text-muted-foreground font-mono text-[11px]">{a.server || '—'}</td>
                  <td className="p-3 font-mono">{a.accountId}</td>
                  <td className="p-3 text-center">
                    {a.status === 'connected' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                        <Wifi size={10} /> Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">
                        <WifiOff size={10} /> Offline
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono">${a.balance.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono">${a.equity.toLocaleString()}</td>
                  <td className="p-3 text-right">{a.openTrades}</td>
                  <td className={`p-3 text-right font-mono font-semibold ${a.dailyPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {a.dailyPnl >= 0 ? '+' : ''}{a.dailyPnl.toFixed(2)}
                  </td>
                  <td className="p-3 text-[10px] text-muted-foreground">{new Date(a.lastSync).toLocaleString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDisconnect(a.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Unlink size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
