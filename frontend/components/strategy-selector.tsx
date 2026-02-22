'use client';

import { Zap, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Strategy = 'sync' | 'async';

interface StrategySelectorProps {
  selected: Strategy | null;
  onSelect: (strategy: Strategy) => void;
  disabled?: boolean;
}

export function StrategySelector({ selected, onSelect, disabled }: StrategySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card
        className={cn(
          'p-6 transition-all border-2',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          selected === 'sync'
            ? 'border-primary ring-2 ring-primary/50 bg-primary/5'
            : disabled
              ? 'border-muted'
              : 'border-muted hover:border-primary/50',
        )}
        onClick={() => !disabled && onSelect('sync')}
      >
        <div className="flex items-start gap-3">
          <Zap className="size-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold">Direct Scan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Instant analysis via HTTP request. Perfect for quick checks.
            </p>
            <p className="text-xs text-muted-foreground mt-2">⚡ Response: ~2-5 sec</p>
          </div>
        </div>
      </Card>

      <Card
        className={cn(
          'p-6 transition-all border-2',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          selected === 'async'
            ? 'border-primary ring-2 ring-primary/50 bg-primary/5'
            : disabled
              ? 'border-muted'
              : 'border-muted hover:border-primary/50',
        )}
        onClick={() => !disabled && onSelect('async')}
      >
        <div className="flex items-start gap-3">
          <Clock className="size-6 text-orange-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold">Cloud Task</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Background job with queue. Best for reliable processing.
            </p>
            <p className="text-xs text-muted-foreground mt-2">⏳ Response: Live monitoring</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
