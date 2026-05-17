'use client';

import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border capitalize',
        getStatusColor(status),
        className
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
