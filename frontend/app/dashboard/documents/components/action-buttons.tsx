import { Button } from '@/components/ui/button';
import { Strategy } from '../types';
import { Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  handleUpload: () => void;
  handleReset: () => void;
  disabled: boolean;
  isLoading: boolean;
  strategy: Strategy | null;
  showReset: boolean;
}

export function ActionButtons({
  handleUpload,
  handleReset,
  disabled,
  isLoading,
  strategy,
  showReset,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={handleUpload} disabled={disabled} size="lg">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Processing...
          </>
        ) : strategy === 'sync' ? (
          'Instant Analyze'
        ) : (
          'Create Analysis Job'
        )}
      </Button>
      {showReset && (
        <Button onClick={handleReset} variant="outline" size="lg">
          Reset
        </Button>
      )}
    </div>
  );
}
