import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { TreePine, CheckCircle2, Link, Wallet, AlertTriangle, Satellite, MapPin, Calendar, Clock, X } from 'lucide-react';
import { Ward } from '../lib/dsa/types';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface ProgressTabProps {
  wards: Record<string, Ward>;
}

export default function ProgressTab({ wards }: ProgressTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  
  const totalSaplings = Object.values(wards).reduce((acc, w) => acc + w.saplingsPlanted, 0);
  
  // Mock metrics
  const wardsCompleted = 4;
  const corridorsReconnected = 2;
  const budgetUsed = totalSaplings * 12;

  // Targets
  const targetTrees = 15000;
  const targetWards = 41;
  const targetCorridors = 8;
  const targetBudget = 200000;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background p-6 space-y-10 pb-24 max-w-5xl mx-auto w-full relative">
      
      {/* Top Section: This Month */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">This Month</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <Card className="bg-card border-border shadow-md col-span-1">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[140px]">
              <TreePine className="size-6 text-emerald-500 mb-2" />
              <div>
                <div className="text-2xl font-black text-foreground font-mono leading-none">{totalSaplings.toLocaleString()} / <span className="text-slate-500 text-lg">{targetTrees.toLocaleString()}</span></div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 mb-2">Trees Planted</div>
                <Progress value={(totalSaplings/targetTrees)*100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md col-span-1">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[140px]">
              <CheckCircle2 className="size-6 text-emerald-500 mb-2" />
              <div>
                <div className="text-2xl font-black text-foreground font-mono leading-none">{wardsCompleted} / <span className="text-slate-500 text-lg">{targetWards}</span></div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 mb-2">Wards Completed</div>
                <Progress value={(wardsCompleted/targetWards)*100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md col-span-1">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[140px]">
              <Link className="size-6 text-teal-500 mb-2" />
              <div>
                <div className="text-2xl font-black text-foreground font-mono leading-none">{corridorsReconnected} / <span className="text-slate-500 text-lg">{targetCorridors}</span></div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 mb-2">Links Restored</div>
                <Progress value={(corridorsReconnected/targetCorridors)*100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md col-span-1">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[140px]">
              <Wallet className="size-6 text-green-500 mb-2" />
              <div>
                <div className="text-lg font-black text-foreground font-mono mt-1 leading-none">₹{(budgetUsed/1000).toFixed(0)}k / <span className="text-slate-500 text-sm">₹200k</span></div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 mb-2">Budget Used</div>
                <Progress value={(budgetUsed/targetBudget)*100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md col-span-1 bg-teal-900/10 border-teal-500/20">
            <CardContent className="p-4 flex flex-col justify-between h-full min-h-[140px]">
              <Satellite className="size-6 text-teal-500 mb-2" />
              <div>
                <div className="text-3xl font-black text-teal-400 font-mono leading-none">87%</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Confirmed Alive</div>
                <div className="text-[9px] text-teal-500/60 mt-1">Based on last satellite pass</div>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Needs Attention */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">Needs Attention</h2>
        <div className="space-y-4">
          
          <div className="flex items-start gap-4 bg-card/60 p-5 rounded-xl border-l-4 border-l-red-500 border-y border-r border-border shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Overdue by 12 days</span>
              </div>
              <div className="text-base font-bold text-foreground">90-Day Survival Check Overdue</div>
              <div className="text-sm text-muted-foreground mt-1">Baner Hills Open Space needs physical inspection.</div>
              <div className="text-xs text-slate-500 mt-2">Assigned to: Rajesh Patil</div>
              <div className="text-[10px] text-red-400 font-medium mt-1">Legal compliance at risk if unresolved</div>
            </div>
            <Button className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-bold" onClick={() => setModalOpen(true)}>
              Resolve
            </Button>
          </div>

          <div className="flex items-start gap-4 bg-card/60 p-5 rounded-xl border-l-4 border-l-orange-500 border-y border-r border-border shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">Due in 3 days</span>
              </div>
              <div className="text-base font-bold text-foreground">Green Cover Dropped</div>
              <div className="text-sm text-muted-foreground mt-1">Wanowrie ward shows 4% decline in latest satellite pass.</div>
              <div className="text-xs text-slate-500 mt-2">Assigned to: Sneha Desai</div>
            </div>
            <Button variant="outline" className="shrink-0">View</Button>
          </div>

        </div>
      </section>

      {/* Upcoming This Week */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-6">Upcoming This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
            <Calendar className="size-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-slate-200">Kothrud 1-Year Canopy Check</div>
              <div className="text-xs text-muted-foreground mt-1">Due Date: Friday, 24th April</div>
              <div className="text-[10px] text-slate-500 mt-1">Assigned to: Amit K.</div>
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
            <Satellite className="size-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-slate-200">Sentinel-2 Pass: East Pune</div>
              <div className="text-xs text-muted-foreground mt-1">Expected: Saturday, 25th April</div>
              <div className="text-[10px] text-slate-500 mt-1">Will cover Hadapsar, Viman Nagar, Kharadi.</div>
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
            <Clock className="size-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-slate-200">Planting Window Closing</div>
              <div className="text-[11px] font-bold text-orange-400 mt-1">Last window before dry season</div>
              <div className="text-xs text-muted-foreground mt-1">Pashan area needs 400 more trees planted before May 1st.</div>
            </div>
          </div>

        </div>
      </section>

      {/* Checklist Modal */}
      {modalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-card border-border shadow-2xl">
            <CardContent className="p-0">
              <div className="flex justify-between items-center p-4 border-b border-border">
                <h3 className="font-bold text-lg">Resolve Alert</h3>
                <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-white"><X className="size-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 opacity-50">
                  <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs shrink-0">✓</div>
                  <div className="text-sm line-through">Step 1: Visit Baner Hills Open Space</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="text-sm font-bold">Step 2: Count surviving trees</div>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                  <div className="size-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div className="text-sm">Step 3: Upload photo proof</div>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                  <div className="size-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">4</div>
                  <div className="text-sm">Step 4: Confirm and submit</div>
                </div>
              </div>
              <div className="p-4 border-t border-border bg-secondary/30 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={() => {
                  toast.success("Alert Resolved", { description: "Inspection verified and logged." });
                  setModalOpen(false);
                }}>
                  Confirm & Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
