'use client';

import { useState, useEffect } from 'react';
import { UploadDropzone } from '@/components/upload-dropzone';
import { StrategySelector } from '@/components/strategy-selector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { docService } from '@/lib/api/services/docService';
import { Loader2 } from 'lucide-react';

type Strategy = 'sync' | 'async';
type Status = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface AnalysisResult {
  summary?: string;
  keywords?: string[];
  insights?: string[];
  sentiment?: string;
  topics?: string[];
  [key: string]: any;
}

interface ProcessingState {
  status: Status;
  jobId?: string;
  result?: AnalysisResult;
  error?: string;
}

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const handleUpload = async () => {
    if (!selectedFile || !selectedStrategy) return;

    try {
      setProcessing({ status: 'uploading' });

      const result = await docService.uploadDocument(selectedFile, selectedStrategy);

      if (selectedStrategy === 'sync') {
        // Synchronous: result is immediate
        setProcessing({ status: 'complete', result });
      } else {
        // Asynchronous: start polling
        setProcessing({ status: 'processing', jobId: result.jobId });
        startPolling(result.jobId);
      }
    } catch (error) {
      setProcessing({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const startPolling = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const result = await docService.getJobResult(jobId);

        if (result.status === 'completed') {
          setProcessing({ status: 'complete', result });
          if (pollingInterval) clearInterval(pollingInterval);
        } else if (result.status === 'failed') {
          setProcessing({ status: 'error', error: result.error || 'Job failed' });
          if (pollingInterval) clearInterval(pollingInterval);
        }
        // Otherwise keep polling
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedStrategy(null);
    setProcessing({ status: 'idle' });
    if (pollingInterval) clearInterval(pollingInterval);
  };

  return (
    <div className="space-y-8 mx-2">
      <div>
        <h1 className="text-3xl font-bold">AI Document Intelligence</h1>
        <p className="text-muted-foreground mt-2">Upload and analyze documents with AI</p>
      </div>

      {/* Main Flow */}
      <div className="space-y-6">
        {/* 1. Dropzone */}
        <div>
          <h2 className="text-lg font-semibold mb-4">1. Upload Document</h2>
          <UploadDropzone
            onFileSelected={setSelectedFile}
            isLoading={processing.status === 'uploading' || processing.status === 'processing'}
          />
        </div>

        {/* 2. Strategy Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-4">2. Choose Analysis Method</h2>
          <StrategySelector
            selected={selectedStrategy}
            onSelect={setSelectedStrategy}
            disabled={
              !selectedFile ||
              processing.status === 'uploading' ||
              processing.status === 'processing'
            }
          />
        </div>

        {/* 3. Action Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={
              !selectedFile ||
              !selectedStrategy ||
              processing.status === 'uploading' ||
              processing.status === 'processing'
            }
            size="lg"
          >
            {processing.status === 'uploading' || processing.status === 'processing' ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : selectedStrategy === 'sync' ? (
              'Instant Analyze'
            ) : (
              'Create Analysis Job'
            )}
          </Button>
          {processing.status !== 'idle' && (
            <Button onClick={handleReset} variant="outline" size="lg">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Processing States */}
      {processing.status === 'processing' && selectedStrategy === 'async' && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-blue-600" />
            <div>
              <h3 className="font-semibold">Processing Job...</h3>
              <p className="text-sm text-muted-foreground">Job ID: {processing.jobId}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {processing.status === 'complete' && processing.result && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="space-y-4">
            <h3 className="font-semibold text-green-900">✓ Analysis Complete</h3>

            {/* Summary */}
            {processing.result.summary && (
              <div>
                <h4 className="font-medium mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{processing.result.summary}</p>
              </div>
            )}

            {/* Keywords */}
            {processing.result.keywords && (
              <div>
                <h4 className="font-medium mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {processing.result.keywords.map((kw: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            {processing.result && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Technical View (JSON)
                </summary>
                <pre className="mt-2 p-3 bg-gray-900 text-gray-100 text-xs rounded overflow-auto max-h-64">
                  {JSON.stringify(processing.result, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </Card>
      )}

      {/* Error State */}
      {processing.status === 'error' && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-900">✗ Error</h3>
          <p className="text-sm text-red-700 mt-2">{processing.error}</p>
          <Button onClick={handleReset} variant="outline" className="mt-4">
            Try Again
          </Button>
        </Card>
      )}
    </div>
  );
}
