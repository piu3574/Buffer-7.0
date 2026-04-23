import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip as LeafletTooltip, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from 'next-themes';
import { Ward, AdjacencyList } from '../lib/dsa/types';
import { MapPin, Navigation2, CloudRain, AlertCircle, Wind } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from './ui/drawer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CityMapProps {
  wards: Record<string, Ward>;
  graph: AdjacencyList | null;
  setActiveTab: (tab: 'plan' | 'map' | 'progress') => void;
}

type LayerType = 'urgent' | 'spaces' | 'corridors' | 'soil' | 'weather';

const getSoilDetails = (soil: string) => {
  switch(soil) {
    case 'Clay Loam': return { color: '#451a03', msg: 'Holds moisture well — ideal for deep-rooted Neem and Peepal', species: ['Neem', 'Peepal'] };
    case 'Sandy Loam': return { color: '#fcd34d', msg: 'Drains quickly — suitable for hardy species like Karanj', species: ['Karanj', 'Jamun'] };
    case 'Black Cotton': return { color: '#1e293b', msg: 'Nutrient-rich but swells when wet — good for large canopy trees', species: ['Banyan', 'Mango'] };
    case 'Red Laterite': return { color: '#7f1d1d', msg: 'Acidic and porous — select robust local species', species: ['Ashoka', 'Karanj'] };
    default: return { color: '#333', msg: 'Standard soil', species: ['Neem'] };
  }
};

const getWeatherForWard = (w: Ward) => {
  // Mock weather based on existing variables
  const temp = Math.floor(w.heatExcess * 2) + 28; // Temp between 28 and ~38
  const isRaining = w.floodRisk > 5;
  const windDir = Math.floor(w.windPotential * 360);
  return { temp, isRaining, windDir };
};

export default function CityMap({ wards, graph, setActiveTab }: CityMapProps) {
  const { theme } = useTheme();
  const [activeLayer, setActiveLayer] = useState<LayerType>('urgent');
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  
  const wardList = Object.values(wards);

  const topCriticalWards = useMemo(() => {
    return [...wardList].sort((a, b) => a.ndvi - b.ndvi).slice(0, 5);
  }, [wardList]);

  if (wardList.length === 0) return (
    <div className="w-full h-full bg-secondary/20 flex items-center justify-center animate-pulse">
      <span className="text-muted-foreground font-mono text-sm">Loading Map...</span>
    </div>
  );

  const selectedWard = selectedWardId ? wards[selectedWardId] : null;
  const brokenCorridors = 2; // Mock

  return (
    <div className="w-full h-full relative flex">
      
      {/* Map Area */}
      <div className="flex-1 relative">
        
        {/* Subtle Instruction Banner */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-background/80 backdrop-blur-md px-6 py-2 rounded-full border border-border shadow-lg text-sm font-medium text-foreground">
            Tap any ward to see planting details
          </div>
        </div>

        {/* Layer Toggle */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 overflow-x-auto pb-2 max-w-[90vw]">
          {(['urgent', 'spaces', 'corridors', 'soil', 'weather'] as LayerType[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors shadow-lg backdrop-blur-md border ${
                activeLayer === layer 
                  ? 'bg-emerald-500 text-black border-emerald-400' 
                  : 'bg-card/80 text-foreground border-border hover:bg-secondary'
              }`}
            >
              {layer === 'urgent' && 'Urgent Zones'}
              {layer === 'spaces' && 'Available Spots'}
              {layer === 'corridors' && 'Connectivity Links'}
              {layer === 'soil' && 'Soil Types'}
              {layer === 'weather' && 'Weather'}
            </button>
          ))}
        </div>

        {/* Global Legend (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-card/90 backdrop-blur-md p-4 rounded-xl border border-border shadow-xl w-48 pointer-events-none">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Map Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-red-500" /> Critical Zone</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-orange-500" /> High Priority</div>
            <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-emerald-500" /> Healthy Zone</div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
              <div className="size-2 rounded-full border border-slate-400" />
              <div className="size-4 rounded-full border border-slate-400" />
              <span className="ml-1 text-[10px] text-muted-foreground">Size = Tree Count</span>
            </div>
          </div>
          
          {/* Soil Legend if active */}
          {activeLayer === 'soil' && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-xs">
              <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-[#451a03]" /> Clay Loam</div><span className="text-[9px] text-muted-foreground ml-5">Neem, Peepal, Banyan</span></div>
              <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-[#fcd34d]" /> Sandy Loam</div><span className="text-[9px] text-muted-foreground ml-5">Karanj, Jamun</span></div>
              <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-[#1e293b]" /> Black Cotton</div><span className="text-[9px] text-muted-foreground ml-5">Mango</span></div>
              <div className="flex flex-col gap-1"><div className="flex items-center gap-2"><div className="size-3 rounded-sm bg-[#7f1d1d]" /> Red Laterite</div><span className="text-[9px] text-muted-foreground ml-5">Ashoka</span></div>
            </div>
          )}
        </div>

        <MapContainer 
          center={[18.5204, 73.8567]} 
          zoom={12} 
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          style={{ background: theme === 'dark' ? '#0a0a0a' : '#f8fafc' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={theme === 'dark' 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
          />

          {/* Render Edges */}
          {graph && Object.keys(graph).map(u => {
            const startWard = wards[u];
            if (!startWard) return null;
            return graph[u].map((edge: any, idx: number) => {
              const endWard = wards[edge.to];
              if (!endWard) return null;
              
              if (activeLayer === 'weather' && edge.type === 'wind') {
                // Show wind arrows conceptually
                return (
                  <Polyline key={`wind-${u}-${edge.to}-${idx}`} positions={[startWard.centroid, endWard.centroid]} pathOptions={{ color: '#3b82f6', weight: 1, opacity: 0.4, dashArray: '4, 8' }} />
                );
              } else if (activeLayer === 'corridors') {
                return (
                  <Polyline key={`corr-${u}-${edge.to}-${idx}`} positions={[startWard.centroid, endWard.centroid]} pathOptions={{ color: '#10b981', weight: 2, opacity: 0.6, dashArray: '5, 10' }} />
                );
              }
              return null;
            });
          })}

          {/* Render Wards */}
          {activeLayer !== 'spaces' && wardList.map((w: any) => {
            const urgency = w.ndvi < 0.25 ? 'red' : w.ndvi < 0.35 ? 'orange' : 'green';
            let fillColor = urgency === 'red' ? '#ef4444' : urgency === 'orange' ? '#f97316' : '#10b981';
            let fillOpacity = urgency === 'red' ? 0.8 : 0.4;
            let radius = Math.max(10, 20 * (1 - w.ndvi)); // Size by sapling need mock
            const weather = getWeatherForWard(w);
            
            if (activeLayer === 'soil') {
              fillColor = getSoilDetails(w.soilType).color;
              fillOpacity = 0.8;
            } else if (activeLayer === 'weather') {
              fillColor = weather.temp > 35 ? '#ef4444' : weather.temp >= 30 ? '#f59e0b' : '#3b82f6';
              fillOpacity = 0.7;
            } else if (activeLayer === 'corridors') {
              fillColor = '#10b981';
              fillOpacity = 0.3;
            }

            const isTopCritical = topCriticalWards.some(tw => tw.id === w.id);

            return (
              <CircleMarker
                key={w.id}
                center={w.centroid}
                pathOptions={{ fillColor, fillOpacity, color: '#000', weight: 1 }}
                radius={radius}
                eventHandlers={{ click: () => setSelectedWardId(w.id) }}
              >
                {/* Always-on label for top 5 critical zones */}
                {activeLayer === 'urgent' && isTopCritical && (
                  <LeafletTooltip permanent direction="right" offset={[radius, 0]} className="bg-transparent border-0 shadow-none font-bold text-white text-xs drop-shadow-md">
                    {w.name}
                  </LeafletTooltip>
                )}
                {/* Weather labels */}
                {activeLayer === 'weather' && (
                  <LeafletTooltip permanent direction="center" className="bg-transparent border-0 shadow-none font-bold text-white text-xs">
                    {weather.temp}°C
                  </LeafletTooltip>
                )}
              </CircleMarker>
            );
          })}

          {/* Render Individual Spots for 'spaces' layer */}
          {activeLayer === 'spaces' && wardList.flatMap(w => 
            w.availableSpaces.map(space => (
              <CircleMarker
                key={space.id}
                center={space.coordinates || w.centroid}
                pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.9, color: '#fff', weight: 2 }}
                radius={8}
                eventHandlers={{ click: () => setSelectedWardId(w.id) }}
              />
            ))
          )}
        </MapContainer>
      </div>

      {/* Right Side Summary Strip */}
      <div className="w-[200px] shrink-0 bg-card border-l border-border flex flex-col p-4 shadow-xl z-10 overflow-y-auto">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">City Summary</h3>
        
        <div className="mb-6">
          <div className="text-4xl font-black text-red-500 font-mono leading-none">{topCriticalWards.length}</div>
          <div className="text-xs font-bold text-slate-300 mt-1">Critical Zones</div>
        </div>

        <div className="mb-6">
          <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">Top 3 Urgent</h4>
          <div className="space-y-3">
            {topCriticalWards.slice(0, 3).map(w => (
              <div key={w.id}>
                <div className="text-sm font-bold text-slate-200">{w.name}</div>
                <div className="text-[10px] text-red-400 font-bold uppercase">Very High Urgency</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-1">Network Status</h4>
          <div className="text-sm font-bold text-orange-400 flex items-center gap-2">
            <AlertCircle className="size-4" /> {brokenCorridors} broken paths
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="text-[10px] text-muted-foreground">Next satellite data in</div>
          <div className="text-lg font-black text-emerald-500 font-mono">2 Days</div>
        </div>
      </div>

      {/* Drawer */}
      <Drawer open={!!selectedWardId} onOpenChange={(open) => !open && setSelectedWardId(null)}>
        <DrawerContent className="bg-card border-border z-[2000]">
          {selectedWard && (() => {
            const isHighUrgency = selectedWard.ndvi < 0.25;
            const urgencyLevel = isHighUrgency ? 'High Urgency' : selectedWard.ndvi < 0.35 ? 'Moderate' : 'Healthy';
            const urgencyColor = isHighUrgency ? 'text-red-500 bg-red-500/10' : selectedWard.ndvi < 0.35 ? 'text-orange-500 bg-orange-500/10' : 'text-emerald-500 bg-emerald-500/10';
            const weather = getWeatherForWard(selectedWard);
            const soilData = getSoilDetails(selectedWard.soilType);
            const survivalRate = 91; // Mock

            return (
              <div className="max-w-2xl mx-auto w-full p-6 max-h-[85vh] overflow-y-auto">
                <DrawerHeader className="px-0 pt-0 text-left">
                  <Badge variant="outline" className={`mb-3 w-fit border-transparent ${urgencyColor}`}>
                    {urgencyLevel}
                  </Badge>
                  <DrawerTitle className="text-4xl font-black">{selectedWard.name}</DrawerTitle>
                </DrawerHeader>
                
                <div className="grid grid-cols-2 gap-4 py-4">
                  {/* Current Conditions */}
                  <div className="bg-secondary/40 rounded-xl p-4 border border-border">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Current Conditions</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        {weather.temp}°C · {weather.isRaining ? 'Rain Forecast' : 'Clear Skies'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Wind className="size-3" /> Winds {weather.windDir}° at 12km/h
                      </div>
                    </div>
                  </div>

                  {/* Soil Type */}
                  <div className="bg-secondary/40 rounded-xl p-4 border border-border">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Soil Data</h4>
                    <div className="text-sm font-bold text-foreground mb-1">{selectedWard.soilType}</div>
                    <div className="text-xs text-muted-foreground">{soilData.msg}</div>
                  </div>
                </div>

                {/* Available Spots */}
                <div className="py-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Available Spots</h4>
                  {selectedWard.availableSpaces.length === 0 ? (
                    <div className="text-sm text-slate-400">No spots identified in this zone yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {selectedWard.availableSpaces.map(spot => (
                        <div key={spot.id} className="flex flex-col p-3 rounded-lg bg-card border border-border">
                          <div className="flex items-start gap-2">
                            <MapPin className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-sm text-foreground">{spot.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">Area: {spot.areaSqMeters} sq m</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Species Recommendation */}
                <div className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recommended Species</h4>
                    <span className="text-xs font-bold text-emerald-400">Est. Survival: {survivalRate}%</span>
                  </div>
                  <div className="flex gap-2">
                    {soilData.species.map(sp => (
                      <Badge key={sp} variant="secondary" className="px-3 py-1.5 cursor-help" title={`Requires low water, fast growing shade tree.`}>
                        {sp}
                      </Badge>
                    ))}
                  </div>
                </div>

                <DrawerFooter className="px-0 pb-2 pt-6">
                  <Button 
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg shadow-xl shadow-emerald-900/20"
                    onClick={() => {
                      setSelectedWardId(null);
                      setActiveTab('plan');
                    }}
                  >
                    Start Planting Here
                  </Button>
                </DrawerFooter>
              </div>
            );
          })()}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
