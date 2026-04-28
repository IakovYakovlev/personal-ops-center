import { Card } from '@/components/ui/card';
import React from 'react';

interface ListPanelProps<T> {
  title: string;
  items: T[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  getId: (item: T) => string | number;
  headerAction?: React.ReactNode;
  emptyText?: string;
  loading?: boolean;
  error?: boolean;
}

export function ListPanel<T>({
  title,
  items,
  selectedId,
  onSelect,
  renderItem,
  getId,
  headerAction,
  emptyText = 'No items',
  loading,
  error,
}: ListPanelProps<T>) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-0 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold leading-none">{title}</h2>
        {headerAction}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg p-3">
        <div className="mb-2 grid grid-cols-[56px_1fr] gap-x-3 border-b border-border/60 pb-2 text-xs text-muted-foreground text-[12px]">
          <span>Id</span>
          <span>Name</span>
        </div>
        <div className="space-y-2 text-sm">
          {loading && (
            <div className="rounded-sm px-1.5 py-0.5 text-muted-foreground">Loading...</div>
          )}
          {error && <div className="rounded-sm px-1.5 py-0.5 text-destructive">Failed to load</div>}
          {!loading && !error && items.length === 0 && (
            <div className="rounded-sm px-1.5 py-0.5 text-muted-foreground">{emptyText}</div>
          )}
          {!loading &&
            !error &&
            items.map((item, index) => {
              const id = getId(item);
              const isSelected = selectedId === id;
              return (
                <div
                  key={id}
                  className={
                    'grid grid-cols-[56px_1fr] gap-x-3 leading-none cursor-pointer rounded transition-colors ' +
                    (isSelected ? 'bg-muted' : 'hover:bg-muted/60')
                  }
                  onClick={() => onSelect(id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                >
                  {renderItem(item, index)}
                </div>
              );
            })}
        </div>
      </div>
    </Card>
  );
}
