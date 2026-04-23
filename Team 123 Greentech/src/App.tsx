import React, { useEffect, useState } from 'react';
import { 
  TreePine, 
  Satellite, 
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
  LayoutList,
  Map as MapIcon,
  BarChart3
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster, toast } from 'sonner';
import { Switch } from './components/ui/switch';
import { ThemeProvider } from './components/theme-provider';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';

// Components
import CityMap from './components/CityMap';
import PlanTab from './components/PlanTab';
import ProgressTab from './components/ProgressTab';
import { Ward, Alert, OptimizationPlanItem, AdjacencyList } from './lib/dsa/types';

function Dashboard() {
  const [wards, setWards] = useState<Record<string, Ward>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<OptimizationPlanItem[]>([]);
  const [graph, setGraph] = useState<AdjacencyList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'plan' | 'map' | 'progress'>('plan');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [wardsRes, alertsRes, graphRes] = await Promise.all([
          fetch('/api/wards'),
          fetch('/api/alerts'),
          fetch('/api/graph')
        ]);
        
        if (!wardsRes.ok || !alertsRes.ok || !graphRes.ok) {
          throw new Error('Failed to load initial data');
        }
        
        const wardsData = await wardsRes.json();
        const alertsData = await alertsRes.json();
        const graphData = await graphRes.json();
        
        setWards(wardsData);
        setAlerts(alertsData);
        setGraph(graphData);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load application data. Please refresh the page.');
        toast.error('Failed to load data', {
          description: 'Please check your connection and try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE') {
          setWards(data.wards);
          setAlerts(data.alerts);
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    return () => eventSource.close();
  }, []);

  const runOptimizer = async () => {
    if (optimizing) return;
    setOptimizing(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saplings: 15000, budget: 75000 })
      });
      if (!res.ok) throw new Error(`Optimization failed`);
      const plan: OptimizationPlanItem[] = await res.json();
      setCurrentPlan(plan);
      toast.success('Plan Generated', { description: `Optimized route created for today.` });
      setActiveTab('plan'); // Automatically switch to plan tab
    } catch (err) {
      toast.error('Failed to generate plan');
    } finally {
      setOptimizing(false);
    }
  };

  const recordPlanting = async (wardId: string, count: number) => {
    try {
      await fetch('/api/record-planting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wardId, count })
      });
    } catch (error) {
      toast.error('Failed to record planting');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-background h-screen items-center justify-center font-sans text-foreground">
        <TreePine className="size-8 text-emerald-500 animate-pulse mb-4" />
        <h1 className="text-lg font-bold tracking-tight">Loading Field Tools...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col bg-background h-screen items-center justify-center font-sans text-foreground p-4">
        <AlertTriangle className="size-8 text-red-500 mb-4" />
        <h1 className="text-lg font-bold text-red-500 mb-2">Connection Error</h1>
        <p className="text-sm text-center mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // --- Dynamic Subtitles Data ---
  const planTotalTrees = currentPlan.reduce((acc, item) => acc + item.count, 0);
  const planSpotsCount = currentPlan.length; // Approximate spots as wards for now, or calculate accurately
  const criticalZonesCount = Object.values(wards).filter(w => w.ndvi < 0.25).length;
  // Use mock logic for pending alerts count if backend doesn't provide explicit 'pending' status
  const pendingAlertsCount = 3; 

  const navItems = [
    {
      id: 'plan',
      label: "Today's Plan",
      icon: LayoutList,
      subtitle: planSpotsCount > 0 ? `${planSpotsCount} spots · ${planTotalTrees} trees` : 'No active plan',
      badge: 0
    },
    {
      id: 'map',
      label: "City Map",
      icon: MapIcon,
      subtitle: `${criticalZonesCount} critical zones`,
      badge: 0
    },
    {
      id: 'progress',
      label: "Progress & Alerts",
      icon: BarChart3,
      subtitle: 'Monthly targets & checks',
      badge: pendingAlertsCount
    }
  ] as const;

  return (
    <div className="flex bg-background h-screen overflow-hidden font-sans text-foreground">
      <Toaster theme={theme === 'dark' ? 'dark' : 'light'} position="top-right" richColors />
      
      {/* Permanent Left Sidebar (Fixed 250px) */}
      <aside className="w-[250px] bg-emerald-950 flex flex-col shrink-0 text-white z-50 border-r border-emerald-900 shadow-xl">
        {/* Logo Section */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-emerald-900/50">
          <div className="size-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <TreePine className="size-5 text-black" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[15px] font-bold tracking-tight leading-none">GREENLEDGER</h1>
            <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-widest mt-1">Field Officer</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-start gap-3 p-3 text-left transition-all duration-200 rounded-r-xl rounded-l-sm overflow-hidden ${
                  isActive 
                    ? 'bg-emerald-900/60 border-l-4 border-emerald-500 text-white shadow-sm' 
                    : 'border-l-4 border-transparent text-emerald-100/70 hover:bg-emerald-900/30 hover:text-white'
                }`}
              >
                <Icon className={`size-5 mt-0.5 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-emerald-500/60'}`} />
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-emerald-200' : 'text-emerald-400/50'}`}>
                    {item.subtitle}
                  </div>
                </div>
                {item.badge > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg">
                    {item.badge}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Actions & Footer */}
        <div className="p-4 border-t border-emerald-900/50 flex flex-col gap-4">
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 shadow-lg shadow-emerald-900/20" 
            onClick={runOptimizer} 
            disabled={optimizing}
          >
            {optimizing ? <RefreshCw className="size-3 animate-spin mr-2" /> : <RefreshCw className="size-3 mr-2" />}
            Generate Plan
          </Button>
          
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2">
                <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} className="scale-75" />
                <span className="text-[10px] text-emerald-400/70 uppercase font-bold tracking-widest">{theme === 'dark' ? 'Dark' : 'Light'}</span>
             </div>
          </div>
          
          <div className="text-[9px] text-emerald-500/40 font-mono text-center pt-2 uppercase tracking-widest">
            Powered by Satellite Data
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full"
          >
            {activeTab === 'plan' && <PlanTab plan={currentPlan} wards={wards} onMarkPlanted={recordPlanting} setActiveTab={setActiveTab} />}
            {activeTab === 'map' && <CityMap wards={wards} graph={graph} setActiveTab={setActiveTab} />}
            {activeTab === 'progress' && <ProgressTab wards={wards} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Dashboard />
    </ThemeProvider>
  );
}
