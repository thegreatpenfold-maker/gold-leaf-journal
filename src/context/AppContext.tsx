import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trade, JournalEntry, PlaybookEntry, ConnectedAccount, AppSettings, defaultSettings } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

interface AppState {
  trades: Trade[];
  journalEntries: JournalEntry[];
  playbooks: PlaybookEntry[];
  accounts: ConnectedAccount[];
  settings: AppSettings;
  onboarded: boolean;
  loading: boolean;
}

interface AppContextType extends AppState {
  addTrade: (trade: Trade) => Promise<void>;
  updateTrade: (trade: Trade) => Promise<void>;
  deleteTrades: (ids: string[]) => Promise<void>;
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (entry: JournalEntry) => Promise<void>;
  addPlaybook: (entry: PlaybookEntry) => Promise<void>;
  updatePlaybook: (entry: PlaybookEntry) => Promise<void>;
  deletePlaybook: (id: string) => Promise<void>;
  addAccount: (account: ConnectedAccount) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setOnboarded: () => void;
  clearAllData: () => void;
  importData: (data: Partial<AppState>) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const db = useSupabaseData();

  const [state, setState] = useState<AppState>({
    trades: [],
    journalEntries: [],
    playbooks: [],
    accounts: [],
    settings: defaultSettings,
    onboarded: false,
    loading: true,
  });

  // Load data from Supabase when user logs in
  const refreshData = useCallback(async () => {
    if (!user) {
      setState(s => ({ ...s, trades: [], journalEntries: [], playbooks: [], accounts: [], loading: false }));
      return;
    }
    try {
      const [trades, journalEntries, playbooks, accounts, profile] = await Promise.all([
        db.fetchTrades(), db.fetchJournal(), db.fetchPlaybooks(), db.fetchAccounts(), db.fetchProfile(),
      ]);
      setState(s => ({
        ...s,
        trades,
        journalEntries,
        playbooks,
        accounts,
        loading: false,
        onboarded: true,
        settings: profile ? {
          profileName: profile.display_name || 'Trader',
          currency: profile.currency || 'USD',
          defaultLotSize: Number(profile.default_lot_size) || 0.01,
          defaultRiskPercent: Number(profile.default_risk_percent) || 1,
          preferredSessions: profile.preferred_sessions || ['London', 'New York'],
          darkMode: profile.dark_mode ?? true,
          accentColor: profile.accent_color || 'gold',
          notifications: profile.notifications ?? true,
        } : defaultSettings,
      }));
    } catch (err) {
      console.error('Failed to load data:', err);
      setState(s => ({ ...s, loading: false }));
    }
  }, [user, db]);

  useEffect(() => {
    refreshData();
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.darkMode);
  }, [state.settings.darkMode]);

  const addTrade = useCallback(async (trade: Trade) => {
    await db.insertTrade(trade);
    setState(s => ({ ...s, trades: [trade, ...s.trades] }));
  }, [db]);

  const updateTrade = useCallback(async (trade: Trade) => {
    await db.updateTrade(trade);
    setState(s => ({ ...s, trades: s.trades.map(t => t.id === trade.id ? trade : t) }));
  }, [db]);

  const deleteTrades = useCallback(async (ids: string[]) => {
    await db.deleteTrades(ids);
    setState(s => ({ ...s, trades: s.trades.filter(t => !ids.includes(t.id)) }));
  }, [db]);

  const addJournalEntry = useCallback(async (entry: JournalEntry) => {
    await db.insertJournal(entry);
    setState(s => ({ ...s, journalEntries: [entry, ...s.journalEntries] }));
  }, [db]);

  const updateJournalEntry = useCallback(async (entry: JournalEntry) => {
    await db.updateJournal(entry);
    setState(s => ({ ...s, journalEntries: s.journalEntries.map(e => e.id === entry.id ? entry : e) }));
  }, [db]);

  const addPlaybook = useCallback(async (entry: PlaybookEntry) => {
    await db.insertPlaybook(entry);
    setState(s => ({ ...s, playbooks: [entry, ...s.playbooks] }));
  }, [db]);

  const updatePlaybook = useCallback(async (entry: PlaybookEntry) => {
    await db.updatePlaybook(entry);
    setState(s => ({ ...s, playbooks: s.playbooks.map(p => p.id === entry.id ? entry : p) }));
  }, [db]);

  const deletePlaybook = useCallback(async (id: string) => {
    await db.deletePlaybook(id);
    setState(s => ({ ...s, playbooks: s.playbooks.filter(p => p.id !== id) }));
  }, [db]);

  const addAccount = useCallback(async (account: ConnectedAccount) => {
    await db.insertAccount(account);
    setState(s => ({ ...s, accounts: [account, ...s.accounts] }));
  }, [db]);

  const removeAccount = useCallback(async (id: string) => {
    await db.removeAccount(id);
    setState(s => ({ ...s, accounts: s.accounts.filter(a => a.id !== id) }));
  }, [db]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setState(s => {
      const newSettings = { ...s.settings, ...partial };
      // Persist to Supabase profile
      if (user) {
        const updates: Record<string, any> = {};
        if ('profileName' in partial) updates.display_name = partial.profileName;
        if ('currency' in partial) updates.currency = partial.currency;
        if ('defaultLotSize' in partial) updates.default_lot_size = partial.defaultLotSize;
        if ('defaultRiskPercent' in partial) updates.default_risk_percent = partial.defaultRiskPercent;
        if ('preferredSessions' in partial) updates.preferred_sessions = partial.preferredSessions;
        if ('darkMode' in partial) updates.dark_mode = partial.darkMode;
        if ('accentColor' in partial) updates.accent_color = partial.accentColor;
        if ('notifications' in partial) updates.notifications = partial.notifications;
        if (Object.keys(updates).length) db.updateProfile(updates).catch(console.error);
      }
      return { ...s, settings: newSettings };
    });
  }, [user, db]);

  const setOnboarded = useCallback(() => setState(s => ({ ...s, onboarded: true })), []);
  const clearAllData = useCallback(() => {
    setState(s => ({ ...s, trades: [], journalEntries: [], playbooks: [], accounts: [], settings: defaultSettings }));
    toast.success('All local data cleared');
  }, []);
  const importData = useCallback((data: Partial<AppState>) => setState(s => ({ ...s, ...data })), []);

  return (
    <AppContext.Provider value={{
      ...state, addTrade, updateTrade, deleteTrades, addJournalEntry, updateJournalEntry,
      addPlaybook, updatePlaybook, deletePlaybook, addAccount, removeAccount,
      updateSettings, setOnboarded, clearAllData, importData, refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
