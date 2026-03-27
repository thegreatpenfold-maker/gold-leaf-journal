import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Moon, Sun, Trash2, Download, Upload } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, clearAllData, trades, journalEntries, playbooks } = useApp();

  const exportJSON = () => {
    const data = { trades, journalEntries, playbooks, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'penfoldfx-backup.json'; a.click();
    toast.success('Data exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        localStorage.setItem('forex-journal-data', JSON.stringify({ ...data, onboarded: true }));
        window.location.reload();
      } catch { toast.error('Invalid file'); }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('Are you sure? This will delete ALL your data permanently.')) {
      clearAllData();
      toast.success('All data cleared');
    }
  };

  const inputCls = "px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Profile</h3>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Trader Name</label>
          <input value={settings.profileName} onChange={e => updateSettings({ profileName: e.target.value })} className={`${inputCls} w-full`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Currency</label>
            <select value={settings.currency} onChange={e => updateSettings({ currency: e.target.value })} className={`${inputCls} w-full`}>
              {['USD', 'GBP', 'EUR', 'ZAR', 'AUD', 'CAD', 'JPY', 'CHF', 'NZD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Default Lot Size</label>
            <input type="number" step="0.01" value={settings.defaultLotSize} onChange={e => updateSettings({ defaultLotSize: +e.target.value })} className={`${inputCls} w-full`} />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground mb-1.5 block uppercase tracking-wide font-medium">Default Risk %</label>
          <input type="number" step="0.25" value={settings.defaultRiskPercent} onChange={e => updateSettings({ defaultRiskPercent: +e.target.value })} className={`${inputCls} w-full`} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Appearance</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm">Dark Mode</span>
          <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className={`p-2 rounded-lg border transition-colors ${settings.darkMode ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'}`}>
            {settings.darkMode ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Data</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"><Download size={13} /> Export JSON</button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors">
            <Upload size={13} /> Import Data
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"><Trash2 size={13} /> Clear All Data</button>
        </div>
      </div>
    </div>
  );
}
