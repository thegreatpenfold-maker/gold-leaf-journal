import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trade, JournalEntry, PlaybookEntry, ConnectedAccount } from '@/lib/types';

// Convert DB row to app Trade type
function rowToTrade(row: any): Trade {
  return {
    id: row.id,
    date: row.date,
    closeDate: row.close_date || undefined,
    pair: row.pair,
    direction: row.direction as 'Long' | 'Short',
    entry: Number(row.entry),
    sl: Number(row.sl),
    tp: Number(row.tp),
    lotSize: Number(row.lot_size),
    result: row.result as 'Win' | 'Loss' | 'Breakeven',
    pnl: Number(row.pnl),
    rr: Number(row.rr),
    commission: Number(row.commission),
    strategy: row.strategy || '',
    emotion: row.emotion || 3,
    confidence: row.confidence || 3,
    screenshot: row.screenshot || undefined,
    notes: row.notes || '',
    mistakes: row.mistakes || [],
    duration: row.duration || undefined,
  };
}

function tradeToRow(trade: Trade, userId: string) {
  return {
    id: trade.id,
    user_id: userId,
    date: trade.date,
    close_date: trade.closeDate || null,
    pair: trade.pair,
    direction: trade.direction,
    entry: trade.entry,
    sl: trade.sl,
    tp: trade.tp,
    lot_size: trade.lotSize,
    result: trade.result,
    pnl: trade.pnl,
    rr: trade.rr,
    commission: trade.commission,
    strategy: trade.strategy,
    emotion: trade.emotion,
    confidence: trade.confidence,
    screenshot: trade.screenshot || null,
    notes: trade.notes,
    mistakes: trade.mistakes,
    duration: trade.duration || null,
  };
}

function rowToJournal(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    mindset: row.mindset || 3,
    preMarket: row.pre_market || '',
    review: row.review || '',
    mistakes: row.mistakes || '',
    lessons: row.lessons || '',
    notes: row.notes || '',
  };
}

function rowToPlaybook(row: any): PlaybookEntry {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    rules: row.rules || [],
    conditions: row.conditions || '',
    screenshot: row.screenshot || undefined,
    strategyTag: row.strategy_tag || '',
  };
}

function rowToAccount(row: any): ConnectedAccount {
  return {
    id: row.id,
    broker: row.broker,
    accountId: row.account_id,
    apiKey: '',
    secret: '',
    server: row.server || '',
    status: row.status as 'connected' | 'disconnected',
    balance: Number(row.balance) || 0,
    equity: Number(row.equity) || 0,
    openTrades: row.open_trades || 0,
    dailyPnl: Number(row.daily_pnl) || 0,
    lastSync: row.last_sync || new Date().toISOString(),
  };
}

export function useSupabaseData() {
  const { user } = useAuth();

  // === TRADES ===
  const fetchTrades = useCallback(async (): Promise<Trade[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToTrade);
  }, [user]);

  const insertTrade = useCallback(async (trade: Trade) => {
    if (!user) return;
    const { error } = await supabase.from('trades').insert(tradeToRow(trade, user.id));
    if (error) throw error;
  }, [user]);

  const updateTrade = useCallback(async (trade: Trade) => {
    if (!user) return;
    const row = tradeToRow(trade, user.id);
    const { error } = await supabase.from('trades').update(row).eq('id', trade.id);
    if (error) throw error;
  }, [user]);

  const deleteTrades = useCallback(async (ids: string[]) => {
    if (!user) return;
    const { error } = await supabase.from('trades').delete().in('id', ids);
    if (error) throw error;
  }, [user]);

  // === JOURNAL ===
  const fetchJournal = useCallback(async (): Promise<JournalEntry[]> => {
    if (!user) return [];
    const { data, error } = await supabase.from('journal_entries').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToJournal);
  }, [user]);

  const insertJournal = useCallback(async (entry: JournalEntry) => {
    if (!user) return;
    const { error } = await supabase.from('journal_entries').insert({
      id: entry.id, user_id: user.id, date: entry.date, mindset: entry.mindset,
      pre_market: entry.preMarket, review: entry.review, mistakes: entry.mistakes,
      lessons: entry.lessons, notes: entry.notes,
    });
    if (error) throw error;
  }, [user]);

  const updateJournal = useCallback(async (entry: JournalEntry) => {
    if (!user) return;
    const { error } = await supabase.from('journal_entries').update({
      date: entry.date, mindset: entry.mindset, pre_market: entry.preMarket,
      review: entry.review, mistakes: entry.mistakes, lessons: entry.lessons, notes: entry.notes,
    }).eq('id', entry.id);
    if (error) throw error;
  }, [user]);

  // === PLAYBOOKS ===
  const fetchPlaybooks = useCallback(async (): Promise<PlaybookEntry[]> => {
    if (!user) return [];
    const { data, error } = await supabase.from('playbooks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToPlaybook);
  }, [user]);

  const insertPlaybook = useCallback(async (entry: PlaybookEntry) => {
    if (!user) return;
    const { error } = await supabase.from('playbooks').insert({
      id: entry.id, user_id: user.id, name: entry.name, description: entry.description,
      rules: entry.rules, conditions: entry.conditions, screenshot: entry.screenshot || null,
      strategy_tag: entry.strategyTag,
    });
    if (error) throw error;
  }, [user]);

  const updatePlaybook = useCallback(async (entry: PlaybookEntry) => {
    if (!user) return;
    const { error } = await supabase.from('playbooks').update({
      name: entry.name, description: entry.description, rules: entry.rules,
      conditions: entry.conditions, screenshot: entry.screenshot || null, strategy_tag: entry.strategyTag,
    }).eq('id', entry.id);
    if (error) throw error;
  }, [user]);

  const deletePlaybook = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('playbooks').delete().eq('id', id);
    if (error) throw error;
  }, [user]);

  // === ACCOUNTS ===
  const fetchAccounts = useCallback(async (): Promise<ConnectedAccount[]> => {
    if (!user) return [];
    const { data, error } = await supabase.from('connected_accounts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToAccount);
  }, [user]);

  const insertAccount = useCallback(async (account: ConnectedAccount) => {
    if (!user) return;
    const { error } = await supabase.from('connected_accounts').insert({
      id: account.id, user_id: user.id, broker: account.broker, account_id: account.accountId,
      server: account.server || '', status: account.status,
      balance: account.balance, equity: account.equity, open_trades: account.openTrades,
      daily_pnl: account.dailyPnl, last_sync: account.lastSync,
    });
    if (error) throw error;
  }, [user]);

  const removeAccount = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('connected_accounts').delete().eq('id', id);
    if (error) throw error;
  }, [user]);

  // === PROFILE ===
  const fetchProfile = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (error) return null;
    return data;
  }, [user]);

  const updateProfile = useCallback(async (updates: Record<string, any>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
    if (error) throw error;
  }, [user]);

  return {
    fetchTrades, insertTrade, updateTrade, deleteTrades,
    fetchJournal, insertJournal, updateJournal,
    fetchPlaybooks, insertPlaybook, updatePlaybook, deletePlaybook,
    fetchAccounts, insertAccount, removeAccount,
    fetchProfile, updateProfile,
  };
}
