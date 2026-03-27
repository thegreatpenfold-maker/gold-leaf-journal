import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import AppLayout from "@/components/AppLayout";
import OnboardingModal from "@/components/OnboardingModal";
import Dashboard from "@/pages/Dashboard";
import TradeLog from "@/pages/TradeLog";
import AddTrade from "@/pages/AddTrade";
import Analytics from "@/pages/Analytics";
import CalendarView from "@/pages/CalendarView";
import Journal from "@/pages/Journal";
import Playbook from "@/pages/Playbook";
import RiskCalculator from "@/pages/RiskCalculator";
import EconomicCalendar from "@/pages/EconomicCalendar";
import AccountConnect from "@/pages/AccountConnect";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Sonner />
        <OnboardingModal />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trades" element={<TradeLog />} />
              <Route path="/add-trade" element={<AddTrade />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/playbook" element={<Playbook />} />
              <Route path="/risk-calculator" element={<RiskCalculator />} />
              <Route path="/economic-calendar" element={<EconomicCalendar />} />
              <Route path="/accounts" element={<AccountConnect />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
