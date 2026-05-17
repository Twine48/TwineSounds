'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue' | 'purple';
  index?: number;
}

const colorMap = {
  indigo: 'from-indigo-500 to-indigo-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
};

const bgColorMap = {
  indigo: 'bg-indigo-500/10',
  emerald: 'bg-emerald-500/10',
  amber: 'bg-amber-500/10',
  red: 'bg-red-500/10',
  blue: 'bg-blue-500/10',
  purple: 'bg-purple-500/10',
};

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  index = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                'text-xs font-medium',
                changeType === 'positive' && 'text-emerald-400',
                changeType === 'negative' && 'text-red-400',
                changeType === 'neutral' && 'text-slate-400'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center',
            bgColorMap[color]
          )}
        >
          <div className={cn('w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center', colorMap[color])}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
