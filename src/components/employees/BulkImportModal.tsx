import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ImportStatus = 'idle' | 'preview' | 'uploading' | 'complete' | 'error';

interface ParsedEmployee {
  name: string;
  email: string;
  phone: string;
  city: string;
  department: string;
  mealTypes: string;
  status: string;
  valid: boolean;
  error?: string;
}

const SAMPLE_COLUMNS = ['Employee Name', 'Email', 'Phone No', 'City', 'Department', 'Meal Types', 'Status'];

const SAMPLE_DATA = [
  ['Rahul Sharma', 'rahul@company.com', '+91 98765 43210', 'Mumbai', 'Engineering', 'Lunch,Dinner', 'Active'],
  ['Priya Patel', 'priya@company.com', '+91 98765 43211', 'Delhi', 'Marketing', 'Breakfast,Lunch', 'Active'],
  ['Amit Kumar', 'amit@company.com', '+91 98765 43212', 'Bangalore', 'Sales', 'Lunch', 'Active'],
  ['Sneha Reddy', 'sneha@company.com', '+91 98765 43213', 'Hyderabad', 'HR', 'Breakfast,Lunch,Snacks', 'Inactive'],
  ['Vikram Singh', 'vikram@company.com', '+91 98765 43214', 'Chennai', 'Finance', 'Lunch,Snacks', 'Active'],
];

export default function BulkImportModal({ open, onClose, onSuccess }: BulkImportModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedEmployee[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: { row: number; message: string }[] } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      parseFile(droppedFile);
    } else {
      toast({ title: 'Invalid File', description: 'Please upload a CSV file.', variant: 'destructive' });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        toast({ title: 'Empty file', description: 'The file does not contain any data rows.', variant: 'destructive' });
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      const parsed: ParsedEmployee[] = dataLines.map(line => {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const [name, email, phone, city, department, mealTypes, statusVal] = cols;

        let valid = true;
        let error = '';

        if (!name || name.length < 2) { valid = false; error = 'Name is required (min 2 chars)'; }
        else if (!email || !email.includes('@')) { valid = false; error = 'Invalid email'; }
        else if (!city) { valid = false; error = 'City is required'; }
        else if (!mealTypes) { valid = false; error = 'Meal types required'; }

        return {
          name: name || '',
          email: email || '',
          phone: phone || '',
          city: city || '',
          department: department || '',
          mealTypes: mealTypes || '',
          status: statusVal || 'Active',
          valid,
          error,
        };
      });

      setParsedData(parsed);
      setStatus('preview');
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const csvContent = [
      SAMPLE_COLUMNS.join(','),
      ...SAMPLE_DATA.map(row => row.join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee-import-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Sample Downloaded', description: 'Check your downloads folder for employee-import-sample.csv' });
  };

  const handleImport = async () => {
    setStatus('uploading');
    setProgress(0);

    const validRows = parsedData.filter(r => r.valid);
    const invalidRows = parsedData.filter(r => !r.valid);

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 200);

    await new Promise(r => setTimeout(r, 1500));
    clearInterval(interval);
    setProgress(100);

    setImportResult({
      success: validRows.length,
      failed: invalidRows.length,
      errors: invalidRows.map((r, i) => ({
        row: parsedData.indexOf(r) + 2,
        message: r.error || 'Unknown error',
      })),
    });
    setStatus('complete');

    if (validRows.length > 0) {
      toast({
        title: '✅ Import Completed',
        description: `Successfully imported ${validRows.length} employees. Super Admin has been notified.`,
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setParsedData([]);
    setImportResult(null);
    onClose();
    if (status === 'complete' && importResult && importResult.success > 0) {
      onSuccess();
    }
  };

  const validCount = parsedData.filter(r => r.valid).length;
  const invalidCount = parsedData.filter(r => !r.valid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <input id="file-input" type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Drop your CSV file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Supports CSV files</p>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Required columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_COLUMNS.map(col => (
                    <Badge key={col} variant="outline" className="text-xs">{col}</Badge>
                  ))}
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleDownloadSample} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Download Sample CSV
              </Button>
            </>
          )}

          {status === 'preview' && (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {parsedData.length} rows found · <span className="text-success">{validCount} valid</span>
                    {invalidCount > 0 && <> · <span className="text-destructive">{invalidCount} errors</span></>}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setParsedData([]); setStatus('idle'); }}>Change</Button>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden sm:table-cell">Phone</TableHead>
                      <TableHead className="hidden md:table-cell">City</TableHead>
                      <TableHead className="hidden lg:table-cell">Department</TableHead>
                      <TableHead className="hidden md:table-cell">Meals</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, i) => (
                      <TableRow key={i} className={!row.valid ? 'bg-destructive/5' : ''}>
                        <TableCell className="text-xs">{i + 2}</TableCell>
                        <TableCell className="text-xs font-medium">{row.name || '—'}</TableCell>
                        <TableCell className="text-xs">{row.email || '—'}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell">{row.phone || '—'}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{row.city || '—'}</TableCell>
                        <TableCell className="text-xs hidden lg:table-cell">{row.department || '—'}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell">{row.mealTypes || '—'}</TableCell>
                        <TableCell>
                          {row.valid ? (
                            <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Valid</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">{row.error}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {status === 'uploading' && (
            <div className="py-8 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="font-medium">Importing {validCount} employees...</p>
              <Progress value={progress} className="mt-4" />
              <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
            </div>
          )}

          {status === 'complete' && importResult && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-2xl font-bold">{importResult.success}</p>
                  <p className="text-sm text-muted-foreground">Imported</p>
                </div>
                {importResult.failed > 0 && (
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold">{importResult.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-destructive/5 rounded-lg p-3">
                  <p className="font-medium text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" /> Errors
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, i) => (
                      <p key={i} className="text-sm text-muted-foreground">Row {error.row}: {error.message}</p>
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
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {status === 'preview' && (
            <>
              <Button variant="outline" onClick={() => { setFile(null); setParsedData([]); setStatus('idle'); }}>Back</Button>
              <Button onClick={handleImport} disabled={validCount === 0}>
                Import {validCount} Employee{validCount !== 1 ? 's' : ''}
              </Button>
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
