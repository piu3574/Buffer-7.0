import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Activity, 
  Users, 
  Waves, 
  Wind, 
  Thermometer, 
  AlertTriangle,
  Info,
  CalendarCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Ward } from '../lib/dsa/types';

interface ZoneDetailProps {
  ward: Ward | null;
}

export default function ZoneDetail({ ward }: ZoneDetailProps) {
  if (!ward) return null;

  const data = [
    { name: 'Satellite NDVI', val: ward.ndvi, max: 1, color: '#ef4444' },
    { name: 'Pop Density', val: (ward.population / ward.maxPopulation), max: 1, color: '#3b82f6' },
  ];

  const getNdviStatus = (ndvi: number) => {
    if (ndvi < 0.15) return { label: 'CRITICAL (WHO)', color: 'text-red-500' };
    if (ndvi < 0.25) return { label: 'ALERT (3-30-300)', color: 'text-orange-500' };
    return { label: 'STABLE', color: 'text-emerald-500' };
  };

  const status = getNdviStatus(ward.ndvi);

  return (
    <section className="bg-card/40 rounded-2xl border border-border p-4 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Focus Zone Detail</h3>
          <h4 className="text-xl font-bold tracking-tight">{ward.name}</h4>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono text-red-500 tracking-tighter">{(ward.deficitScore).toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 uppercase font-bold">Deficit Score</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-secondary/50 p-3 rounded-lg border border-border">
          <div className="flex justify-between text-[10px] uppercase font-bold mb-1 text-slate-400">
            <span>Satellite NDVI</span>
            <span className={status.color}>{ward.ndvi.toFixed(2)} ({status.label})</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${status.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${ward.ndvi * 100}%` }}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-center font-mono">
          <div className="bg-white/5 p-2 rounded-lg">
            <span className="block text-[9px] text-slate-500 uppercase font-bold">Soil Type</span>
            <span className="text-xs text-emerald-400 uppercase font-bold">Black Regur</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg">
            <span className="block text-[9px] text-slate-500 uppercase font-bold">Heat Flux</span>
            <span className="text-xs text-amber-400 font-bold">+{ward.heatExcess.toFixed(1)}°C</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center font-mono">
          <div className="bg-white/5 p-2 rounded-lg">
            <span className="block text-[9px] text-slate-500 uppercase font-bold">Flood Risk</span>
            <span className={`text-xs font-bold ${ward.floodRisk > 5 ? 'text-blue-400' : 'text-slate-400'}`}>{ward.floodRisk}/10</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg">
            <span className="block text-[9px] text-slate-500 uppercase font-bold">People Benefited</span>
            <span className="text-xs text-white font-bold">{(ward.population / 1000).toFixed(1)}K</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ date, label, completed = false }: { date: string, label: string, completed?: boolean }) {
  return (
    <div className="flex items-start gap-3 relative group">
      <div className="flex flex-col items-center">
        <div className={`size-2 rounded-full border-2 ${completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'} group-last:after:hidden after:absolute after:top-2 after:bottom-[-20px] after:w-px after:bg-white/10`} />
      </div>
      <div className="flex-1 -mt-1 pb-4">
        <div className="text-[10px] font-mono text-muted-foreground uppercase">{date}</div>
        <div className={`text-xs font-medium ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</div>
      </div>
    </div>
  );
}
