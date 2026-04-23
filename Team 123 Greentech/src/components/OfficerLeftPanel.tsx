import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, AlertTriangle, Wind, Waves, Thermometer, Filter, Leaf, Info } from 'lucide-react';
import { Ward, AdjacencyList } from '../lib/dsa/types';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface OfficerLeftPanelProps {
  wards: Record<string, Ward>;
  selectedId: string | null;
  graph: AdjacencyList | null;
  onSelectWard: (id: string) => void;
  filters: {
    criticalOnly: boolean;
    hasSpace: boolean;
    brokenCorridor: boolean;
    soilType: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const CollapsibleSection = ({ title, children, defaultOpen = true, icon: Icon }: any) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl bg-card/40 overflow-hidden flex-shrink-0">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex justify-between items-center p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-emerald-500" />}
          <span className="font-bold text-xs uppercase tracking-widest text-slate-400">{title}</span>
        </div>
        {open ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
      </button>
      {open && <div className="p-3 border-t border-border bg-black/20">{children}</div>}
    </div>
  );
};

export default function OfficerLeftPanel({ wards, selectedId, graph, onSelectWard, filters, setFilters }: OfficerLeftPanelProps) {
  const selectedWard = selectedId ? wards[selectedId] : null;

  // --- Precalculate Gaps ---
  const gaps: any[] = [];
  const seenEdges = new Set<string>();
  
  if (graph) {
    Object.keys(graph).forEach(u => {
      const uWard = wards[u];
      if (!uWard) return;
      graph[u].forEach(edge => {
        if (edge.type === 'adjacency') {
          const v = edge.to;
          const vWard = wards[v];
          if (!vWard) return;
          
          const edgeId = [u, v].sort().join('-');
          if (seenEdges.has(edgeId)) return;
          seenEdges.add(edgeId);

          const uLow = uWard.ndvi < 0.25;
          const vLow = vWard.ndvi < 0.25;
          const uHigh = uWard.ndvi >= 0.35;
          const vHigh = vWard.ndvi >= 0.35;

          if ((uLow && vHigh) || (vLow && uHigh)) {
             gaps.push({ u, v, uName: uWard.name, vName: vWard.name, needed: 1, target: uLow ? u : v });
          } else if (uLow && vLow) {
             gaps.push({ u, v, uName: uWard.name, vName: vWard.name, needed: 2, target: u });
          }
        }
      });
    });
  }

  // --- Species Logic ---
  const getSpeciesForSoil = (soil: string) => {
    switch (soil) {
      case 'Clay Loam': return ['Neem', 'Peepal', 'Banyan'];
      case 'Sandy Loam': return ['Jamun', 'Tamarind', 'Karanj'];
      case 'Black Cotton': return ['Peepal', 'Banyan'];
      case 'Red Laterite': return ['Karanj', 'Neem'];
      default: return ['Mango', 'Gulmohar', 'Ashoka'];
    }
  };

  // --- Restrictions Logic ---
  const restrictions = [];
  if (selectedWard) {
    if (selectedWard.floodRisk > 5) {
      restrictions.push({ icon: Waves, label: 'Flood Zone', text: 'Plant deep-rooted species only.' });
    }
    if (selectedWard.heatExcess > 3) {
      restrictions.push({ icon: Thermometer, label: 'Extreme Heat Zone', text: 'Drought-hardy species only.' });
    }
    if (graph && graph[selectedWard.id]) {
      if (graph[selectedWard.id].some(e => e.type === 'wind')) {
        restrictions.push({ icon: Wind, label: 'Wind Corridor', text: 'Planting here cools 2 neighboring wards.' });
      }
      if (graph[selectedWard.id].some(e => e.type === 'drainage')) {
        restrictions.push({ icon: Waves, label: 'Drainage Path', text: 'Use water-tolerant species.' });
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Section 5: Filter Wards */}
      <CollapsibleSection title="Filter Wards" icon={Filter}>
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Critical Only</span>
            <Switch checked={filters.criticalOnly} onCheckedChange={(c: boolean) => setFilters({...filters, criticalOnly: c})} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Has Available Space</span>
            <Switch checked={filters.hasSpace} onCheckedChange={(c: boolean) => setFilters({...filters, hasSpace: c})} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Broken Corridor</span>
            <Switch checked={filters.brokenCorridor} onCheckedChange={(c: boolean) => setFilters({...filters, brokenCorridor: c})} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">By Soil Type</span>
            <select 
              className="bg-secondary text-foreground text-xs p-1 rounded border border-border outline-none"
              value={filters.soilType}
              onChange={(e) => setFilters({...filters, soilType: e.target.value})}
            >
              <option value="All">All Soils</option>
              <option value="Clay Loam">Clay Loam</option>
              <option value="Sandy Loam">Sandy Loam</option>
              <option value="Black Cotton">Black Cotton</option>
              <option value="Red Laterite">Red Laterite</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <ScrollArea className="flex-1 pr-2">
        <div className="flex flex-col gap-4">
          
          {/* Section 1: Where Can We Plant? */}
          <CollapsibleSection title="Where Can We Plant?" icon={MapPin}>
            {!selectedWard ? (
              <div className="text-xs text-muted-foreground text-center py-4 font-mono">Select a ward on the map</div>
            ) : selectedWard.availableSpaces.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4 font-mono">No available spaces mapped.</div>
            ) : (
              <div className="space-y-2">
                {selectedWard.availableSpaces.map(space => (
                  <div key={space.id} className="bg-secondary/30 p-2 rounded-lg border border-border/50 text-xs cursor-pointer hover:bg-emerald-500/10 transition-colors">
                    <div className="font-bold text-emerald-400 mb-1 truncate">{space.name}</div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{space.type}</span>
                      <span>{space.areaSqMeters} sq.m</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Est. Capacity: <span className="text-foreground">{space.estCapacity} saplings</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Section 2: What's the Ground Like? */}
          <CollapsibleSection title="What's the Ground Like?" icon={Leaf}>
            {!selectedWard ? (
              <div className="text-xs text-muted-foreground text-center py-4 font-mono">Select a ward on the map</div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Soil Type</div>
                  <Badge variant="outline" className="bg-amber-900/20 text-amber-500 border-amber-900/50 rounded-sm">
                    {selectedWard.soilType}
                  </Badge>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Recommended Species</div>
                  <div className="flex flex-wrap gap-1">
                    {getSpeciesForSoil(selectedWard.soilType).map(sp => (
                      <Badge key={sp} variant="secondary" className="bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 text-[10px] rounded-sm">
                        <Leaf className="size-3 mr-1" /> {sp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* Section 3: Any Restrictions Here? */}
          <CollapsibleSection title="Any Restrictions Here?" icon={AlertTriangle}>
            {!selectedWard ? (
              <div className="text-xs text-muted-foreground text-center py-4 font-mono">Select a ward on the map</div>
            ) : restrictions.length === 0 ? (
              <div className="text-xs text-emerald-500 text-center py-4 font-mono flex items-center justify-center gap-2">
                <Info className="size-4" /> No major restrictions
              </div>
            ) : (
              <div className="space-y-2">
                {restrictions.map((r, i) => (
                  <div key={i} className="flex gap-2 items-start bg-red-950/20 border border-red-900/30 p-2 rounded-lg">
                    <r.icon className="size-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-red-400">{r.label}</div>
                      <div className="text-[10px] text-red-300/70 font-mono mt-0.5">{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Section 4: Corridor Gaps */}
          <CollapsibleSection title="Corridor Gaps — High Impact" icon={AlertTriangle}>
            {gaps.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4 font-mono">No critical gaps identified.</div>
            ) : (
              <div className="space-y-2">
                {gaps.map((gap, i) => (
                  <div 
                    key={i} 
                    className="bg-secondary/30 p-2 rounded-lg border border-border/50 text-xs cursor-pointer hover:bg-emerald-500/10 transition-colors"
                    onClick={() => onSelectWard(gap.target)}
                  >
                    <div className="font-bold text-emerald-400 mb-1">{gap.uName} ↔ {gap.vName}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground font-mono">{gap.needed} ward(s) to bridge</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[9px] rounded-sm py-0 h-4 border-0">
                        Plant here = 2x impact
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

        </div>
      </ScrollArea>
    </div>
  );
}
