import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Satellite, Sprout, AlertTriangle } from 'lucide-react';

interface AlertsPanelProps {
  alerts: any[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getColor = (msg: string) => {
    if (msg.includes('Recorded')) return 'text-emerald-400/80';
    if (msg.includes('Satellite')) return 'text-amber-400';
    if (msg.includes('Critical')) return 'text-red-400';
    return 'text-slate-500';
  };

  return (
    <div className="h-full bg-transparent flex flex-col p-4">
      <div className="flex-1 overflow-hidden space-y-1.5 font-mono text-[10px]">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${getColor(alert.msg)} truncate`}
            >
              [{alert.time}] {alert.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
