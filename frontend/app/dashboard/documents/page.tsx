'use client';

/**
 * Documents Page - AI Document Intelligence
 *
 * Architecture decisions:
 * - State management: see ADR-0003 (TanStack Query + Zustand strategy)
 * - UI structure: see ADR-0004 (JobResult + ActionButtons componentization)
 *
 * Related docs:
 * - docs/architecture/adr/0003-frontend-state-management-strategy.md
 * - docs/architecture/adr/0004-documents-page-ui-componentization.md
 */

import { useCallback, useState } from 'react';
import { UploadDropzone } from '@/components/upload-dropzone';
import { StrategySelector } from '@/components/strategy-selector';
import { useDocumentUpload } from '@/lib/api/hooks/documents/use-document-upload';
import { AnalysisResult } from '@/lib/api/types/documents';
import { useJobPolling } from '@/lib/api/hooks/documents/use-job-polling';
import { ProcessingState, Strategy } from './types';
import { JobResult } from './components/job-result';
import { ActionButtons } from './components/action-buttons';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
  const upload = useDocumentUpload();

  const handleUpload = () => {
    if (!selectedFile || !selectedStrategy) return;

    // Validate file size before uploading
    if (selectedFile.size > MAX_FILE_SIZE) {
      setProcessing({
        status: 'error',
        error: 'File size exceeds 5MB limit.',
      });
      return;
    }

    const strategy = selectedStrategy;

    upload.mutate(
      { file: selectedFile, strategy },
      {
        onSuccess: (response) => {
          if (strategy === 'sync') {
            setProcessing({
              status: 'complete',
              result: response.result as AnalysisResult,
              stats: response.stats,
              plan: response.plan,
            });
          } else {
            // Asynchronous: result contains jobId
            const { jobId } = response.result as { jobId: string };
            setProcessing({
              status: 'processing',
              jobId,
              stats: response.stats,
              plan: response.plan,
            });
          }
        },
        onError: (error: Error) => {
          setProcessing({
            status: 'error',
            error: error.message,
          });
        },
      },
    );
  };

  const handleJobSuccess = useCallback((result: AnalysisResult) => {
    setProcessing((prev) => ({
      ...prev,
      status: 'complete',
      result,
    }));
  }, []);

  const handleJobError = useCallback((error: string) => {
    setProcessing((prev) => ({
      ...prev,
      status: 'error',
      error,
    }));
  }, []);

  useJobPolling(processing.jobId, {
    onSuccess: handleJobSuccess,
    onError: handleJobError,
  });

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedStrategy(null);
    setProcessing({ status: 'idle' });
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
            isLoading={upload.isPending || processing.status === 'processing'}
          />
        </div>

        {/* 2. Strategy Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-4">2. Choose Analysis Method</h2>
          <StrategySelector
            selected={selectedStrategy}
            onSelect={setSelectedStrategy}
            disabled={!selectedFile || upload.isPending || processing.status === 'processing'}
          />
        </div>

        {/* 3. Action Button */}
        <ActionButtons
          handleUpload={handleUpload}
          handleReset={handleReset}
          disabled={
            !selectedFile ||
            !selectedStrategy ||
            upload.isPending ||
            processing.status === 'processing'
          }
          isLoading={upload.isPending || processing.status === 'processing'}
          strategy={selectedStrategy}
          showReset={processing.status !== 'idle'}
        />
      </div>

      {/* Job Result (processing/complete/error states) */}
      <JobResult processing={processing} onRetry={handleReset} />
    </div>
  );
}
