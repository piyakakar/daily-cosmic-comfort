import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import Index from "./pages/Index";
import NaamNumerology from "./pages/NaamNumerology";
import BirthdayReport from "./pages/BirthdayReport";
import DailyFlags from "./pages/DailyFlags";
import LoveEnergy from "./pages/LoveEnergy";
import DailyMessage from "./pages/DailyMessage";
import CareerAstrology from "./pages/CareerAstrology";
import Affirmations from "./pages/Affirmations";
import Premium from "./pages/Premium";
import Dashboard from "./pages/Dashboard";
import CompatibilityChart from "./pages/CompatibilityChart";
import ExplainMyDay from "./pages/ExplainMyDay";
import CosmicCalendar from "./pages/CosmicCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isPlaying, volume, toggleMusic, increaseVolume, decreaseVolume } = useBackgroundMusic();

  return (
    <>
      <Navigation 
        isMusicPlaying={isPlaying} 
        onToggleMusic={toggleMusic}
        volume={volume}
        onVolumeIncrease={increaseVolume}
        onVolumeDecrease={decreaseVolume}
      />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/naam-numerology" element={<NaamNumerology />} />
        <Route path="/birthday-report" element={<BirthdayReport />} />
        <Route path="/daily-flags" element={<DailyFlags />} />
        <Route path="/love-energy" element={<LoveEnergy />} />
        <Route path="/daily-message" element={<DailyMessage />} />
        <Route path="/career-astrology" element={<CareerAstrology />} />
        <Route path="/affirmations" element={<Affirmations />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/compatibility" element={<CompatibilityChart />} />
        <Route path="/explain-my-day" element={<ExplainMyDay />} />
        <Route path="/cosmic-calendar" element={<CosmicCalendar />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
