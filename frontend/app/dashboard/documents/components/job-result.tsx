import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ProcessingState } from '../types';
import { Button } from '@/components/ui/button';

interface JobResultProps {
  processing: ProcessingState;
  onRetry: () => void;
}

export function JobResult({ processing, onRetry }: JobResultProps) {
  // Processing state
  if (processing.status === 'processing') {
    return (
      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold">Processing Job...</h3>
              <p className="text-sm text-muted-foreground">Job ID: {processing.jobId}</p>
            </div>
          </div>

          {/* Usage Stats */}
          {processing.stats && (
            <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-muted-foreground mb-2">
                Plan: <span className="font-medium">{processing.plan}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Symbols:</span>{' '}
                  <span className="font-medium">
                    {processing.stats.symbols.used.toLocaleString()} /{' '}
                    {processing.stats.symbols.limit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Requests:</span>{' '}
                  <span className="font-medium">
                    {processing.stats.requests.used} / {processing.stats.requests.limit}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Complete state
  if (processing.status === 'complete' && processing.result) {
    return (
      <Card className="p-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              ✓ Analysis Complete
            </h3>
            {processing.plan && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                {processing.plan}
              </span>
            )}
          </div>

          {/* Summary */}
          {processing.result.summary && (
            <div>
              <h4 className="font-medium mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{processing.result.summary}</p>
            </div>
          )}

          {/* Keywords */}
          {processing.result.keywords && processing.result.keywords.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {processing.result.keywords.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment */}
          {processing.result.sentiment && (
            <div>
              <h4 className="font-medium mb-2">Sentiment</h4>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  processing.result.sentiment === 'positive'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : processing.result.sentiment === 'negative'
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                }`}
              >
                {processing.result.sentiment}
              </span>
            </div>
          )}

          {/* Main Topics */}
          {processing.result.main_topics && processing.result.main_topics.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Main Topics</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {processing.result.main_topics.map((topic: string, i: number) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Insights */}
          {processing.result.insights && processing.result.insights.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Insights</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {processing.result.insights.map((insight: string, i: number) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Usage Stats */}
          {processing.stats && (
            <div className="pt-3 border-t border-green-200 dark:border-green-800">
              <h4 className="font-medium mb-2 text-xs text-green-900 dark:text-green-100">
                Usage Statistics
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Symbols Used</p>
                  <p className="font-medium">
                    {processing.stats.symbols.used.toLocaleString()} /{' '}
                    {processing.stats.symbols.limit.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Remaining: {processing.stats.symbols.remaining.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Requests Used</p>
                  <p className="font-medium">
                    {processing.stats.requests.used} / {processing.stats.requests.limit}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Remaining: {processing.stats.requests.remaining}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON */}
          {processing.result && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-green-900 dark:text-green-100">
                Technical View (JSON)
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 dark:bg-gray-950 text-gray-100 text-xs rounded overflow-auto max-h-64">
                {JSON.stringify(processing.result, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </Card>
    );
  }

  // Error state
  if (processing.status === 'error') {
    return (
      <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
        <h3 className="font-semibold text-red-900 dark:text-red-100">✗ Error</h3>
        <p className="text-sm text-red-700 dark:text-red-300 mt-2">{processing.error}</p>
        <Button onClick={onRetry} variant="outline" className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }
}
