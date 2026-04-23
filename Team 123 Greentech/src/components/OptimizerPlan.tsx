import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle2, Navigation, Sprout, TrendingDown, MoreHorizontal } from 'lucide-react';

interface OptimizerPlanProps {
  plan: any[];
  onExecute: (wardId: string, count: number) => void;
}

export default function OptimizerPlan({ plan, onExecute }: OptimizerPlanProps) {
  if (plan.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <TrendingDown className="size-8 text-muted/30 mb-2" />
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
          No active plan generated
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full font-mono">
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout">
          {plan.map((item, idx) => (
            <motion.div
              key={`${item.wardId}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 border-b border-white/5 hover:bg-emerald-500/5 cursor-pointer flex gap-4 group transition-colors"
            >
              <div className="text-emerald-500 text-lg font-bold w-6">
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-bold truncate">{item.wardName}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">+{item.score.toFixed(1)} Score</span>
                </div>
                <div className="text-[9px] text-muted-foreground truncate">
                  {item.species.slice(0, 2).join(', ')} ({item.count})
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-6 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onExecute(item.wardId, item.count);
                }}
              >
                <CheckCircle2 className="size-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
