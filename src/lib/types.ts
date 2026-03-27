export interface Trade {
  id: string;
  date: string;
  closeDate?: string;
  pair: string;
  direction: 'Long' | 'Short';
  entry: number;
  sl: number;
  tp: number;
  lotSize: number;
  result: 'Win' | 'Loss' | 'Breakeven';
  pnl: number;
  rr: number;
  commission: number;
  strategy: string;
  emotion: number;
  confidence: number;
  screenshot?: string;
  notes: string;
  mistakes: string[];
  duration?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mindset: number;
  preMarket: string;
  review: string;
  mistakes: string;
  lessons: string;
  notes: string;
}

export interface PlaybookEntry {
  id: string;
  name: string;
  description: string;
  rules: string[];
  conditions: string;
  screenshot?: string;
  strategyTag: string;
}

export interface ConnectedAccount {
  id: string;
  broker: string;
  accountId: string;
  apiKey: string;
  secret: string;
  status: 'connected' | 'disconnected';
  balance: number;
  equity: number;
  openTrades: number;
  dailyPnl: number;
  lastSync: string;
}

export interface AppSettings {
  profileName: string;
  currency: string;
  defaultLotSize: number;
  defaultRiskPercent: number;
  preferredSessions: string[];
  darkMode: boolean;
  accentColor: string;
  notifications: boolean;
}

export const FOREX_PAIRS = [
  'EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','USD/CAD','NZD/USD',
  'EUR/GBP','EUR/JPY','GBP/JPY','AUD/JPY','EUR/AUD','EUR/CAD','EUR/CHF',
  'GBP/AUD','GBP/CAD','GBP/CHF','GBP/NZD','AUD/CAD','AUD/CHF','AUD/NZD',
  'NZD/CAD','NZD/CHF','NZD/JPY','CAD/JPY','CHF/JPY','EUR/NZD','USD/SGD',
  'USD/HKD','USD/ZAR','USD/MXN','XAU/USD','XAG/USD',
];

export const STRATEGIES = [
  'Breakout','Trend Follow','Reversal','Scalp','News Trade',
  'Support & Resistance','ICT/SMC','Fibonacci','Other',
];

export const MISTAKES = [
  'FOMO','Revenge Trade','Early Exit','Late Entry',
  'Overleverage','Moved SL','No Setup','Other',
];

export const BROKERS = [
  'MT4','MT5','cTrader','Binance','Bybit',
  'Interactive Brokers','OANDA','Pepperstone','IC Markets','Other',
];

export const EMOTIONS = ['😡','😟','😐','🙂','😎'];

export const MARKET_SESSIONS = [
  { name: 'Sydney', open: 21, close: 6, color: 'hsl(200, 70%, 50%)' },
  { name: 'Tokyo', open: 0, close: 9, color: 'hsl(0, 70%, 55%)' },
  { name: 'London', open: 7, close: 16, color: 'hsl(220, 70%, 55%)' },
  { name: 'New York', open: 13, close: 22, color: 'hsl(142, 70%, 45%)' },
];

export const defaultSettings: AppSettings = {
  profileName: 'Trader',
  currency: 'USD',
  defaultLotSize: 0.01,
  defaultRiskPercent: 1,
  preferredSessions: ['London', 'New York'],
  darkMode: true,
  accentColor: 'gold',
  notifications: true,
};
