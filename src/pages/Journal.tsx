import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { Search, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { EMOTIONS } from '@/lib/types';

export default function Journal() {
  const { journalEntries, addJournalEntry, updateJournalEntry } = useApp();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');

  const existing = journalEntries.find(e => e.date === selectedDate);
  const [form, setForm] = useState({
    mindset: existing?.mindset || 3,
    preMarket: existing?.preMarket || '',
    review: existing?.review || '',
    mistakes: existing?.mistakes || '',
    lessons: existing?.lessons || '',
    notes: existing?.notes || '',
  });

  const loadEntry = (date: string) => {
    setSelectedDate(date);
    const e = journalEntries.find(x => x.date === date);
    if (e) setForm({ mindset: e.mindset, preMarket: e.preMarket, review: e.review, mistakes: e.mistakes, lessons: e.lessons, notes: e.notes });
    else setForm({ mindset: 3, preMarket: '', review: '', mistakes: '', lessons: '', notes: '' });
  };

  const handleSave = () => {
    if (existing) {
      updateJournalEntry({ ...existing, ...form });
    } else {
      addJournalEntry({ id: crypto.randomUUID(), date: selectedDate, ...form });
    }
    toast.success('Journal entry saved');
  };

  const filteredEntries = useMemo(() => {
    if (!search) return journalEntries.sort((a, b) => b.date.localeCompare(a.date));
    return journalEntries.filter(e => e.preMarket.toLowerCase().includes(search.toLowerCase()) || e.review.toLowerCase().includes(search.toLowerCase()) || e.notes.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date));
  }, [journalEntries, search]);

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Entry List */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Journal</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." className="pl-8 pr-3 py-2 rounded-lg bg-card border border-border text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {filteredEntries.map(e => (
            <button key={e.id} onClick={() => loadEntry(e.date)} className={`w-full text-left p-3 rounded-lg text-sm transition-all ${e.date === selectedDate ? 'bg-primary/10 border border-primary/30' : 'bg-card border border-border hover:border-primary/20'}`}>
              <div className="font-semibold">{format(new Date(e.date + 'T00:00'), 'MMM d, yyyy')}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>Mindset: {EMOTIONS[e.mindset - 1]}</span>
                <span>•</span>
                <span className="truncate">{e.preMarket.slice(0, 40) || 'No notes'}</span>
              </div>
            </button>
          ))}
          {filteredEntries.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No entries yet</p>}
        </div>
      </div>

      {/* Entry Form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <input type="date" value={selectedDate} onChange={e => loadEntry(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            <Save size={14} /> Save
          </button>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Mindset Rating</label>
            <div className="flex gap-3">
              {EMOTIONS.map((em, i) => (
                <button key={i} onClick={() => setForm(f => ({ ...f, mindset: i + 1 }))} className={`text-2xl p-2 rounded-lg transition-all ${form.mindset === i + 1 ? 'bg-primary/20 scale-110 ring-1 ring-primary' : 'opacity-40 hover:opacity-70'}`}>
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div><label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Pre-Market Preparation</label><textarea value={form.preMarket} onChange={e => setForm(f => ({ ...f, preMarket: e.target.value }))} rows={3} className={inputCls} placeholder="What's your plan for today?" /></div>
          <div><label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Trade Review</label><textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} rows={3} className={inputCls} placeholder="How did trading go today?" /></div>
          <div><label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Mistakes</label><textarea value={form.mistakes} onChange={e => setForm(f => ({ ...f, mistakes: e.target.value }))} rows={2} className={inputCls} placeholder="What mistakes did you make?" /></div>
          <div><label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Lessons Learned</label><textarea value={form.lessons} onChange={e => setForm(f => ({ ...f, lessons: e.target.value }))} rows={2} className={inputCls} placeholder="What did you learn?" /></div>
          <div><label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">General Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} placeholder="Any other thoughts..." /></div>
        </div>
      </div>
    </div>
  );
}
