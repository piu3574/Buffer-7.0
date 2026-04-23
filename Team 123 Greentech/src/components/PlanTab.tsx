import React, { useState, useMemo } from 'react';
import { OptimizationPlanItem, Ward, PlantingSpace } from '../lib/dsa/types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { MapPin, Navigation, CheckCircle2, TreePine, Camera, AlertTriangle, CloudRain, ThermometerSun, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PlanTabProps {
  plan: OptimizationPlanItem[];
  wards: Record<string, Ward>;
  onMarkPlanted: (wardId: string, count: number) => void;
  setActiveTab: (tab: 'plan' | 'map' | 'progress') => void;
}

// Mock helper functions
const getMockAddress = (wardId: string, spotName: string) => {
  return `Near Gate 3, opposite HDFC Bank, ${spotName}, ${wardId.toUpperCase()}`;
};

const getSurvivalRate = (soilType: string, species: string) => {
  if (soilType === 'Clay Loam') return 91;
  if (soilType === 'Sandy Loam') return 74;
  if (soilType === 'Black Cotton') return 88;
  return 82;
};

const getSpeciesListForSpot = (spotType: string, count: number) => {
  const breakdown = [];
  if (spotType === 'Roadside') {
    breakdown.push({ name: 'Neem', count: Math.ceil(count * 0.8), color: 'bg-emerald-500/20 text-emerald-500' });
    breakdown.push({ name: 'Karanj', count: Math.floor(count * 0.2), color: 'bg-teal-500/20 text-teal-500' });
  } else if (spotType === 'Park') {
    breakdown.push({ name: 'Peepal', count: Math.ceil(count * 0.6), color: 'bg-green-500/20 text-green-500' });
    breakdown.push({ name: 'Banyan', count: Math.floor(count * 0.4), color: 'bg-emerald-500/20 text-emerald-500' });
  } else if (spotType === 'School Ground' || spotType === 'Hospital Ground') {
    breakdown.push({ name: 'Peepal', count: Math.ceil(count * 0.5), color: 'bg-teal-500/20 text-teal-500' });
    breakdown.push({ name: 'Neem', count: Math.floor(count * 0.5), color: 'bg-emerald-500/20 text-emerald-500' });
  } else {
    breakdown.push({ name: 'Jamun', count: Math.ceil(count * 0.5), color: 'bg-indigo-500/20 text-indigo-400' });
    breakdown.push({ name: 'Karanj', count: Math.floor(count * 0.5), color: 'bg-teal-500/20 text-teal-500' });
  }
  return breakdown.filter(b => b.count > 0);
};

export default function PlanTab({ plan, wards, onMarkPlanted }: PlanTabProps) {
  const [plantingSpot, setPlantingSpot] = useState<{ wardId: string; space: PlantingSpace; spotId: string } | null>(null);
  const [plantCount, setPlantCount] = useState<number>(0);
  const [completedSpots, setCompletedSpots] = useState<Set<string>>(new Set());

  // Flatten spots
  const allSpots = useMemo(() => {
    const spots: { ward: Ward; countToPlant: number; space: PlantingSpace; id: string }[] = [];
    plan.forEach((item) => {
      const ward = wards[item.wardId];
      if (ward && ward.availableSpaces.length > 0) {
        const countPerSpace = Math.floor(item.count / ward.availableSpaces.length);
        ward.availableSpaces.forEach(space => {
          spots.push({ ward, countToPlant: countPerSpace, space, id: `${ward.id}-${space.id}` });
        });
      }
    });
    return spots;
  }, [plan, wards]);

  if (plan.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <TreePine className="size-16 mb-6 opacity-20" />
        <h2 className="text-2xl font-bold text-slate-300">No active plan</h2>
        <p className="text-sm mt-2">Generate today's plan from the sidebar.</p>
      </div>
    );
  }

  const totalSpots = allSpots.length;
  const targetTrees = allSpots.reduce((acc, s) => acc + s.countToPlant, 0);
  const targetBudget = targetTrees * 12;

  const plantedTrees = Array.from(completedSpots).reduce((acc, spotId) => {
    const spot = allSpots.find(s => s.id === spotId);
    return acc + (spot?.countToPlant || 0);
  }, 0);
  const usedBudget = plantedTrees * 12;

  const prioritySpot = allSpots.find(s => !completedSpots.has(s.id));
  const isAllComplete = completedSpots.size === totalSpots && totalSpots > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      
      {/* Dynamic Banner */}
      <div className="shrink-0 z-10">
        {isAllComplete ? (
          <div className="bg-emerald-500 text-black p-4 px-6 flex items-center justify-between shadow-lg">
            <div>
              <div className="font-black text-lg flex items-center gap-2"><CheckCircle2 className="size-5" /> All Spots Completed!</div>
              <div className="text-sm font-medium mt-1">Planted {plantedTrees} trees across {completedSpots.size} spots. 3 corridors reconnected.</div>
            </div>
          </div>
        ) : prioritySpot ? (
          <div className="bg-emerald-900 border-l-4 border-emerald-500 p-4 px-6 shadow-md flex items-center justify-between">
            <div className="flex-1">
              <div className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertCircle className="size-3" /> Start Here
              </div>
              <div className="font-bold text-slate-100">{prioritySpot.space.name} · {prioritySpot.ward.name}</div>
              <div className="text-sm text-emerald-200 mt-0.5">
                Critical Zone · {prioritySpot.countToPlant} Trees · 8 min away
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${prioritySpot.space.coordinates?.[0]},${prioritySpot.space.coordinates?.[1]}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold ml-4">
                <Navigation className="size-4 mr-2" /> Open in Maps
              </Button>
            </a>
          </div>
        ) : null}
      </div>

      {/* Progress Tracker */}
      <div className="px-6 py-4 bg-card border-b border-border shrink-0">
        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
          <span>{completedSpots.size} of {totalSpots} spots</span>
          <span>{plantedTrees.toLocaleString()} of {targetTrees.toLocaleString()} trees</span>
          <span className="hidden md:inline">₹{usedBudget.toLocaleString()} of ₹{targetBudget.toLocaleString()} used</span>
        </div>
        <Progress value={(completedSpots.size / totalSpots) * 100} className="h-2 bg-secondary" />
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 max-w-3xl mx-auto w-full">
        {allSpots.map((item, index) => {
          const species = getSpeciesListForSpot(item.space.type, item.countToPlant);
          const isCompleted = completedSpots.has(item.id);
          const walkTime = index === 0 ? "Starting point" : `${Math.floor(Math.random() * 8) + 2} min walk from previous spot`;
          const survivalRate = getSurvivalRate(item.ward.soilType, species[0]?.name);
          const isHeatAlert = item.ward.heatExcess > 3.6;
          const isRainAlert = item.ward.floodRisk > 5;
          const carryForward = item.id.includes('1') ? 100 : 0; // Mock carry forward

          return (
            <Card key={item.id} className={`bg-card/60 border-border overflow-hidden shadow-lg transition-opacity ${isCompleted ? 'opacity-50' : ''}`}>
              <CardContent className="p-6 relative">
                
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  {isCompleted ? (
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-transparent">Completed</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-700 bg-slate-900/50">Not Started</Badge>
                  )}
                </div>

                {/* Top Line & Address */}
                <div className="mb-4 pr-24">
                  <div className="text-sm font-medium text-foreground mb-1">
                    {item.ward.name} · <span className="text-muted-foreground">{item.space.type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug">
                    {getMockAddress(item.ward.id, item.space.name)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                    <Navigation className="size-3" /> {walkTime}
                  </div>
                </div>

                {/* Hero Tree Count */}
                <div className="mb-4">
                  <div className="text-5xl font-black text-emerald-500 font-mono tracking-tight flex items-baseline gap-2">
                    {item.countToPlant}
                    <span className="text-2xl text-emerald-500/80 font-bold uppercase tracking-wider font-sans">Trees</span>
                  </div>
                </div>

                {/* Species Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {species.map(sp => (
                    <div key={sp.name} className={`px-3 py-1 rounded-full text-xs font-bold ${sp.color}`}>
                      {sp.count} {sp.name}
                    </div>
                  ))}
                </div>

                {/* Secondary Data Rows */}
                <div className="space-y-2 mb-6">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#78350f]/20 text-[#d97706]">
                    {item.ward.soilType} — ideal for {species.map(s=>s.name).join(' & ')}
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground">
                    Available Area: {item.space.areaSqMeters.toLocaleString()} sq m · Fits up to {item.space.estCapacity.toLocaleString()} saplings
                  </div>

                  <div className="text-[11px] font-bold text-emerald-400">
                    Expected Survival: {survivalRate}%
                  </div>

                  {(isHeatAlert || isRainAlert) && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded w-fit mt-1">
                      {isHeatAlert ? <ThermometerSun className="size-3" /> : <CloudRain className="size-3" />}
                      {isHeatAlert ? "Heat Alert — carry extra water for saplings." : "Rain forecast — plant deep-rooted species first."}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border my-6 w-full opacity-50" />

                {/* Action Row */}
                <div className="flex gap-3">
                  <a
                    href={`https://maps.google.com/?q=${item.space.coordinates?.[0]},${item.space.coordinates?.[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full h-11 border-slate-600 hover:bg-slate-800 text-slate-300 font-bold">
                      Open in Maps
                    </Button>
                  </a>
                  <Button variant="outline" className="w-12 shrink-0 h-11 border-slate-600 hover:bg-slate-800 text-slate-300">
                    <Camera className="size-4" />
                  </Button>
                  <Button 
                    disabled={isCompleted}
                    className="flex-[1.5] h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                    onClick={() => {
                      setPlantingSpot({ wardId: item.ward.id, space: item.space, spotId: item.id });
                      setPlantCount(item.countToPlant);
                    }}
                  >
                    <CheckCircle2 className="size-4 mr-2" />
                    {isCompleted ? 'Planted' : 'Mark as Planted'}
                  </Button>
                </div>

                {/* Carry Forward Note */}
                {carryForward > 0 && !isCompleted && (
                  <div className="text-[10px] text-amber-500/70 italic mt-4 text-center">
                    {carryForward} trees carried forward from last round due to weather delay.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Carry Forward Section */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Carried Forward from Previous Round</h3>
          <Card className="bg-secondary/30 border-dashed border-border">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-300">Aundh Park Extension</div>
                <div className="text-xs text-muted-foreground">Paused due to heavy rain. 150 trees remaining.</div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">Add to Today's Route</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Plant Dialog Mock */}
      {plantingSpot && (
        <div className="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <Card className="w-full max-w-sm bg-card border-border shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-1">Confirm Planting</h3>
              <p className="text-sm text-muted-foreground mb-6">{plantingSpot.space.name}</p>
              
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trees Planted</label>
                <input 
                  type="number" 
                  value={plantCount} 
                  onChange={(e) => setPlantCount(Number(e.target.value))}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-4 text-3xl font-black text-center mt-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 h-12" onClick={() => setPlantingSpot(null)}>Cancel</Button>
                <Button 
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-500 font-bold" 
                  onClick={() => {
                    onMarkPlanted(plantingSpot.wardId, plantCount);
                    setCompletedSpots(prev => {
                      const ns = new Set(prev);
                      ns.add(plantingSpot.spotId);
                      return ns;
                    });
                    setPlantingSpot(null);
                    toast.success('Planting Recorded', { description: `Successfully logged ${plantCount} trees.` });
                  }}
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
