import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Trade, JournalEntry, PlaybookEntry, ConnectedAccount, AppSettings, defaultSettings } from '@/lib/types';

interface AppState {
  trades: Trade[];
  journalEntries: JournalEntry[];
  playbooks: PlaybookEntry[];
  accounts: ConnectedAccount[];
  settings: AppSettings;
  onboarded: boolean;
}

interface AppContextType extends AppState {
  addTrade: (trade: Trade) => void;
  updateTrade: (trade: Trade) => void;
  deleteTrades: (ids: string[]) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  addPlaybook: (entry: PlaybookEntry) => void;
  updatePlaybook: (entry: PlaybookEntry) => void;
  deletePlaybook: (id: string) => void;
  addAccount: (account: ConnectedAccount) => void;
  removeAccount: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setOnboarded: () => void;
  clearAllData: () => void;
  importData: (data: Partial<AppState>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'forex-journal-data';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    trades: [],
    journalEntries: [],
    playbooks: [],
    accounts: [],
    settings: defaultSettings,
    onboarded: false,
  };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.darkMode);
  }, [state.settings.darkMode]);

  const addTrade = useCallback((trade: Trade) => setState(s => ({ ...s, trades: [...s.trades, trade] })), []);
  const updateTrade = useCallback((trade: Trade) => setState(s => ({ ...s, trades: s.trades.map(t => t.id === trade.id ? trade : t) })), []);
  const deleteTrades = useCallback((ids: string[]) => setState(s => ({ ...s, trades: s.trades.filter(t => !ids.includes(t.id)) })), []);
  const addJournalEntry = useCallback((entry: JournalEntry) => setState(s => ({ ...s, journalEntries: [...s.journalEntries, entry] })), []);
  const updateJournalEntry = useCallback((entry: JournalEntry) => setState(s => ({ ...s, journalEntries: s.journalEntries.map(e => e.id === entry.id ? entry : e) })), []);
  const addPlaybook = useCallback((entry: PlaybookEntry) => setState(s => ({ ...s, playbooks: [...s.playbooks, entry] })), []);
  const updatePlaybook = useCallback((entry: PlaybookEntry) => setState(s => ({ ...s, playbooks: s.playbooks.map(p => p.id === entry.id ? entry : p) })), []);
  const deletePlaybook = useCallback((id: string) => setState(s => ({ ...s, playbooks: s.playbooks.filter(p => p.id !== id) })), []);
  const addAccount = useCallback((account: ConnectedAccount) => setState(s => ({ ...s, accounts: [...s.accounts, account] })), []);
  const removeAccount = useCallback((id: string) => setState(s => ({ ...s, accounts: s.accounts.filter(a => a.id !== id) })), []);
  const updateSettings = useCallback((partial: Partial<AppSettings>) => setState(s => ({ ...s, settings: { ...s.settings, ...partial } })), []);
  const setOnboarded = useCallback(() => setState(s => ({ ...s, onboarded: true })), []);
  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ trades: [], journalEntries: [], playbooks: [], accounts: [], settings: defaultSettings, onboarded: true });
  }, []);
  const importData = useCallback((data: Partial<AppState>) => setState(s => ({ ...s, ...data })), []);

  return (
    <AppContext.Provider value={{ ...state, addTrade, updateTrade, deleteTrades, addJournalEntry, updateJournalEntry, addPlaybook, updatePlaybook, deletePlaybook, addAccount, removeAccount, updateSettings, setOnboarded, clearAllData, importData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
