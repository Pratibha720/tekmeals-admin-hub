import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { employeesApi } from '@/services/api';
import { BulkImportResult } from '@/types';

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ImportStatus = 'idle' | 'uploading' | 'complete' | 'error';

export default function BulkImportModal({ open, onClose, onSuccess }: BulkImportModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV or XLSX file.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 150);

    try {
      const importResult = await employeesApi.bulkImport(file);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(importResult);
      setStatus('complete');

      if (importResult.success > 0) {
        toast({
          title: 'Import Completed',
          description: `Successfully imported ${importResult.success} employees.`,
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setStatus('error');
      toast({
        title: 'Import Failed',
        description: 'Failed to import employees. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    onClose();
    if (status === 'complete' && result && result.success > 0) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Import Employees</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {status === 'idle' && (
            <>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Drop your file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Supports CSV and XLSX files</p>
              </div>

              {file && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                    Remove
                  </Button>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Required columns:</p>
                <p>Name, Email, City, Meal Types</p>
                <p className="mt-1">Optional: Phone, Department</p>
              </div>
            </>
          )}

          {status === 'uploading' && (
            <div className="py-8 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="font-medium">Importing employees...</p>
              <Progress value={progress} className="mt-4" />
              <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
            </div>
          )}

          {status === 'complete' && result && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-2xl font-bold">{result.success}</p>
                  <p className="text-sm text-muted-foreground">Imported</p>
                </div>
                {result.failed > 0 && (
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold">{result.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="bg-destructive/5 rounded-lg p-3">
                  <p className="font-medium text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Errors
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        Row {error.row}: {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="font-medium">Import Failed</p>
              <p className="text-sm text-muted-foreground mt-1">Please check your file and try again.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleImport} disabled={!file}>Import</Button>
            </>
          )}
          {(status === 'complete' || status === 'error') && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
