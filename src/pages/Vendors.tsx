import { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Search, Wallet, TrendingUp, FileText, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import WeddingHeader from '@/components/WeddingHeader';
import WeddingNav from '@/components/WeddingNav';
import FloatingPhotos from '@/components/FloatingPhotos';
import FileImport from '@/components/FileImport';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Vendor } from '@/types/wedding';
import { vendorTypes } from '@/types/wedding';

const emptyVendor: Omit<Vendor, 'id'> = {
  name: '', type: 'צלם', phone: '', price: 0, paid: 0, status: 'בתהליך', notes: '',
  contractUrl: null, contractName: null,
};

const CONTRACTS_BUCKET = 'contracts';

const statusColors: Record<Vendor['status'], string> = {
  'בתהליך': 'bg-amber-100 text-amber-700 border-amber-200',
  'סגור': 'bg-blue-100 text-blue-700 border-blue-200',
  'שולם': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'בוטל': 'bg-red-100 text-red-700 border-red-200',
};

const vendorColumnMapping = {
  name: ['שם', 'name', 'שם הספק', 'ספק'],
  type: ['סוג', 'type', 'קטגוריה', 'תחום'],
  phone: ['טלפון', 'phone', 'נייד', 'tel'],
  price: ['מחיר', 'price', 'עלות', 'סכום'],
  paid: ['שולם', 'paid', 'ששולם', 'תשלום'],
  status: ['סטטוס', 'status'],
  notes: ['הערות', 'notes', 'הערה'],
};

const parseVendorRow = (row: Record<string, string>): Omit<Vendor, 'id'> | null => {
  if (!row.name) return null;
  const statusMap: Record<string, Vendor['status']> = { 'בתהליך': 'בתהליך', 'סגור': 'סגור', 'שולם': 'שולם', 'בוטל': 'בוטל' };
  return {
    name: row.name,
    type: row.type || 'אחר',
    phone: row.phone || '',
    price: parseInt(row.price) || 0,
    paid: parseInt(row.paid) || 0,
    status: statusMap[row.status] || 'בתהליך',
    notes: row.notes || '',
  };
};

const Vendors = () => {
  const [vendors, setVendors] = useSupabaseTable<Vendor>('vendors');
  const [form, setForm] = useState<Omit<Vendor, 'id'>>(emptyVendor);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContractUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(CONTRACTS_BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('שגיאה בהעלאת הקובץ: ' + uploadError.message);
        return;
      }
      const { data } = supabase.storage.from(CONTRACTS_BUCKET).getPublicUrl(path);
      setForm((f) => ({ ...f, contractUrl: data.publicUrl, contractName: file.name }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveContract = () => {
    setForm((f) => ({ ...f, contractUrl: null, contractName: null }));
  };

  // Migrate old vendors without 'paid' field
  const migratedVendors = vendors.map(v => ({
    ...v,
    paid: v.paid ?? 0,
    contractUrl: v.contractUrl ?? null,
    contractName: v.contractName ?? null,
  }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setVendors(migratedVendors.map((v) => (v.id === editId ? { ...form, id: editId } : v)));
    } else {
      setVendors([...migratedVendors, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyVendor);
    setEditId(null);
    setOpen(false);
  };

  const handleEdit = (vendor: Vendor) => {
    const { id, ...rest } = vendor;
    setForm({ ...rest, paid: rest.paid ?? 0 });
    setEditId(id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setVendors(migratedVendors.filter((v) => v.id !== id));
  };

  const handleImport = (items: Omit<Vendor, 'id'>[]) => {
    const newVendors = items.map((item) => ({ ...item, id: crypto.randomUUID() }));
    setVendors([...migratedVendors, ...newVendors]);
  };

  const filtered = migratedVendors.filter((v) =>
    v.name.includes(search) || v.type.includes(search) || v.phone.includes(search)
  );

  const totalBudget = migratedVendors.reduce((s, v) => s + v.price, 0);
  const paidTotal = migratedVendors.reduce((s, v) => s + v.paid, 0);
  const paidPercent = totalBudget > 0 ? Math.min((paidTotal / totalBudget) * 100, 100) : 0;

  return (
    <div className="min-h-screen relative">
      <FloatingPhotos count={7} seed={91} />
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-display">ניהול ספקים</h2>
            <p className="text-sm text-muted-foreground font-body">
              {migratedVendors.length} ספקים
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <FileImport<Omit<Vendor, 'id'>>
              onImport={handleImport}
              columnMapping={vendorColumnMapping}
              parseRow={parseVendorRow}
              label="ספקים"
              templateHeaders={['שם הספק', 'סוג', 'טלפון', 'מחיר', 'שולם', 'סטטוס', 'הערות']}
            />
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setForm(emptyVendor); setEditId(null); } }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  הוסף ספק
                </Button>
              </DialogTrigger>
              <DialogContent className="font-body" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="font-display">{editId ? 'ערוך ספק' : 'ספק חדש'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>שם הספק</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="שם הספק" />
                  </div>
                  <div className="grid gap-2">
                    <Label>סוג</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {vendorTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>טלפון</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="050-0000000" dir="ltr" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>מחיר כולל (₪)</Label>
                      <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} dir="ltr" />
                    </div>
                    <div className="grid gap-2">
                      <Label>שולם עד כה (₪)</Label>
                      <Input type="number" min={0} value={form.paid} onChange={(e) => setForm({ ...form, paid: parseInt(e.target.value) || 0 })} dir="ltr" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>סטטוס</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Vendor['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="בתהליך">בתהליך</SelectItem>
                        <SelectItem value="סגור">סגור</SelectItem>
                        <SelectItem value="שולם">שולם</SelectItem>
                        <SelectItem value="בוטל">בוטל</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>הערות</Label>
                    <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="הערות (אופציונלי)" />
                  </div>
                  <div className="grid gap-2">
                    <Label>חוזה</Label>
                    {form.contractUrl ? (
                      <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/40">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <a
                          href={form.contractUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex-1 truncate hover:underline"
                        >
                          {form.contractName || 'חוזה'}
                        </a>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={handleRemoveContract}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleContractUpload(file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {uploading ? 'מעלה...' : 'העלה חוזה (PDF / תמונה)'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">ביטול</Button>
                  </DialogClose>
                  <Button onClick={handleSave}>שמור</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Budget Summary Cards */}
        {totalBudget > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="py-4 flex items-center gap-3 bg-gradient-to-l from-primary/5 to-transparent">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">תקציב כולל</p>
                  <p className="text-lg font-display">₪{totalBudget.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="py-4 flex items-center gap-3 bg-gradient-to-l from-emerald-500/5 to-transparent">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">שולם עד כה</p>
                  <p className="text-lg font-display">₪{paidTotal.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budget Progress Bar */}
        {totalBudget > 0 && (
          <Card className="border-border/50">
            <CardContent className="py-4 space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">התקדמות תשלומים</span>
                <span className="font-medium">{paidPercent.toFixed(0)}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-left" dir="ltr">
                ₪{paidTotal.toLocaleString()} / ₪{totalBudget.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, סוג או טלפון..."
            className="pr-10"
          />
        </div>

        {/* Vendor List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground font-body">
                {migratedVendors.length === 0 ? 'עדיין אין ספקים. הוסיפו את הספק הראשון או ייבאו מקובץ!' : 'לא נמצאו תוצאות'}
              </CardContent>
            </Card>
          )}
          {filtered.map((vendor) => {
            const vendorPaidPercent = vendor.price > 0 ? Math.min((vendor.paid / vendor.price) * 100, 100) : 0;
            return (
              <Card key={vendor.id} className="animate-fade-in hover:shadow-md transition-all duration-200 border-border/60">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-base">{vendor.name}</p>
                        <Badge variant="outline" className="text-xs">{vendor.type}</Badge>
                        <Badge variant="outline" className={`text-xs ${statusColors[vendor.status]}`}>{vendor.status}</Badge>
                      </div>
                      {vendor.phone && (
                        <p className="text-sm text-muted-foreground" dir="ltr">{vendor.phone}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">₪{vendor.price.toLocaleString()}</span>
                        <span className="text-muted-foreground">שולם: ₪{vendor.paid.toLocaleString()}</span>
                        {vendor.price > 0 && vendor.paid < vendor.price && (
                          <span className="text-amber-600">נותר: ₪{(vendor.price - vendor.paid).toLocaleString()}</span>
                        )}
                      </div>
                      {vendor.price > 0 && (
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden max-w-xs">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all duration-300"
                            style={{ width: `${vendorPaidPercent}%` }}
                          />
                        </div>
                      )}
                      {vendor.notes && (
                        <p className="text-xs text-muted-foreground">{vendor.notes}</p>
                      )}
                      {vendor.contractUrl && (
                        <a
                          href={vendor.contractUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {vendor.contractName || 'צפה בחוזה'}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(vendor)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(vendor.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Vendors;
