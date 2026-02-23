'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export function UploadDropzone({ onFileSelected, isLoading }: UploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Validate file size (accept prop only filters MIME types)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert('File size must be less than 5MB');
          return;
        }

        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected],
  );

  const onDropRejected = useCallback(() => {
    alert('Only PDF, DOCX, and TXT files are supported');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 5 * 1024 * 1024, // Also enforce at dropzone level
    disabled: isLoading,
  });

  return (
    <Card className="border-2 border-dashed p-12">
      <div {...getRootProps()} className="text-center cursor-pointer">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <Upload className="size-12 text-muted-foreground" />
          <div>
            {isDragActive ? (
              <p className="text-base font-medium">Drop the file here...</p>
            ) : (
              <>
                <p className="text-base font-medium">Drag and drop your document</p>
                <p className="text-sm text-muted-foreground">
                  or click to select (PDF, DOCX, TXT • Max 5MB)
                </p>
              </>
            )}
          </div>
          {selectedFile && (
            <div className="text-sm text-green-600 font-medium">✓ {selectedFile.name} selected</div>
          )}
        </div>
      </div>
    </Card>
  );
}
