import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ColumnMapping {
  [key: string]: string[];
}

interface FileImportProps<T> {
  onImport: (items: T[]) => void;
  columnMapping: ColumnMapping;
  parseRow: (row: Record<string, string>) => T | null;
  label: string;
  templateHeaders: string[];
}

function FileImport<T>({ onImport, columnMapping, parseRow, label, templateHeaders }: FileImportProps<T>) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const findColumn = (headers: string[], aliases: string[]): string | null => {
    for (const h of headers) {
      const normalized = h.trim().toLowerCase();
      if (aliases.some(a => normalized.includes(a.toLowerCase()))) return h;
    }
    return null;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });

        if (json.length === 0) {
          setError('הקובץ ריק');
          return;
        }

        const headers = Object.keys(json[0]);
        const mapping: Record<string, string> = {};

        for (const [field, aliases] of Object.entries(columnMapping)) {
          const found = findColumn(headers, aliases);
          if (found) mapping[field] = found;
        }

        const parsed = json
          .map((row) => {
            const mapped: Record<string, string> = {};
            for (const [field, header] of Object.entries(mapping)) {
              mapped[field] = String(row[header] ?? '').trim();
            }
            return parseRow(mapped);
          })
          .filter(Boolean) as T[];

        if (parsed.length === 0) {
          setError('לא נמצאו שורות תקינות בקובץ. ודאו שהעמודות מתאימות.');
          return;
        }

        setPreview(parsed);
      } catch {
        setError('שגיאה בקריאת הקובץ. ודאו שמדובר בקובץ Excel או CSV תקין.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    onImport(preview);
    toast.success(`${preview.length} רשומות יובאו בהצלחה!`);
    setPreview([]);
    setOpen(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([templateHeaders]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${label}-template.xlsx`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setPreview([]); setError(''); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          ייבוא מקובץ
        </Button>
      </DialogTrigger>
      <DialogContent className="font-body sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-display">ייבוא {label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            העלו קובץ Excel (.xlsx) או CSV עם נתוני {label}. המערכת תזהה אוטומטית את העמודות.
          </p>

          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <FileSpreadsheet className="h-10 w-10 text-primary/60" />
              <span className="text-sm text-muted-foreground">לחצו לבחירת קובץ</span>
              <span className="text-xs text-muted-foreground/60">.xlsx, .xls, .csv</span>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {preview.length > 0 && (
            <div className="bg-secondary/50 p-4 rounded-lg">
              <p className="text-sm font-medium text-secondary-foreground">
                ✓ נמצאו {preview.length} רשומות תקינות לייבוא
              </p>
            </div>
          )}

          <Button variant="link" onClick={downloadTemplate} className="text-xs p-0 h-auto text-muted-foreground">
            ↓ הורדת קובץ תבנית לדוגמה
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ביטול</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={preview.length === 0}>
            ייבוא {preview.length > 0 ? `(${preview.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FileImport;
