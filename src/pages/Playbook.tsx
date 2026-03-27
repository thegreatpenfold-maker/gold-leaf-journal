import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { STRATEGIES } from '@/lib/types';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Playbook() {
  const { playbooks, addPlaybook, updatePlaybook, deletePlaybook, trades } = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', rules: [''], conditions: '', strategyTag: STRATEGIES[0] });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    if (editing) { updatePlaybook({ id: editing, ...form, rules: form.rules.filter(r => r.trim()) }); setEditing(null); }
    else addPlaybook({ id: crypto.randomUUID(), ...form, rules: form.rules.filter(r => r.trim()) });
    setShowForm(false);
    setForm({ name: '', description: '', rules: [''], conditions: '', strategyTag: STRATEGIES[0] });
    toast.success('Playbook saved');
  };

  const editEntry = (id: string) => {
    const p = playbooks.find(x => x.id === id);
    if (!p) return;
    setForm({ name: p.name, description: p.description, rules: p.rules.length ? p.rules : [''], conditions: p.conditions, strategyTag: p.strategyTag });
    setEditing(id); setShowForm(true);
  };

  const getWinRate = (tag: string) => {
    const t = trades.filter(x => x.strategy === tag);
    if (!t.length) return null;
    return ((t.filter(x => x.result === 'Win').length / t.length) * 100).toFixed(1);
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Playbook</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', rules: [''], conditions: '', strategyTag: STRATEGIES[0] }); }} className="flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-primary-foreground font-semibold text-xs"><Plus size={13} /> New Strategy</button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{editing ? 'Edit' : 'New'} Strategy</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-muted-foreground" /></button>
          </div>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Strategy Name" className={inputCls} />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className={inputCls} />
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Rules</label>
            {form.rules.map((r, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground w-5 font-mono">{i + 1}.</span>
                <input value={r} onChange={e => { const rules = [...form.rules]; rules[i] = e.target.value; setForm(f => ({ ...f, rules })); }} className={inputCls} placeholder={`Rule ${i + 1}`} />
              </div>
            ))}
            <button onClick={() => setForm(f => ({ ...f, rules: [...f.rules, ''] }))} className="text-xs text-primary hover:underline">+ Add Rule</button>
          </div>
          <textarea value={form.conditions} onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))} placeholder="Ideal market conditions" rows={2} className={inputCls} />
          <select value={form.strategyTag} onChange={e => setForm(f => ({ ...f, strategyTag: e.target.value }))} className={inputCls}>{STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-primary-foreground font-semibold text-xs"><Save size={13} /> Save</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playbooks.map(p => {
          const wr = getWinRate(p.strategyTag);
          return (
            <div key={p.id} className="bg-card border border-border rounded-xl p-5 space-y-3 hover:border-primary/15 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => editEntry(p.id)} className="text-muted-foreground hover:text-primary transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => { deletePlaybook(p.id); toast.success('Deleted'); }} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{p.strategyTag}</span>
                {wr !== null && <span className={`text-xs font-semibold ${parseFloat(wr) >= 50 ? 'text-success' : 'text-destructive'}`}>{wr}% WR</span>}
              </div>
              {p.rules.length > 0 && (
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-0.5">{p.rules.map((r, i) => <li key={i}>{r}</li>)}</ol>
              )}
              {p.conditions && <p className="text-xs text-muted-foreground italic">Conditions: {p.conditions}</p>}
            </div>
          );
        })}
        {playbooks.length === 0 && <p className="text-muted-foreground text-sm col-span-2 text-center py-8">No strategies yet. Create your first playbook entry.</p>}
      </div>
    </div>
  );
}
