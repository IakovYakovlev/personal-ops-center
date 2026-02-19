'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

export function RateLimitDialog({
  open,
  onOpenChange,
  message = 'Too many requests. Please try again later.',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-red-500 bg-white sm:max-w-md dark:bg-slate-950">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle className="text-red-500">Too Many Attempts</DialogTitle>
          </div>
          <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
