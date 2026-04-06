import { useState } from 'react';
import { Plus, Trash2, Edit2, Search, Wallet, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import WeddingHeader from '@/components/WeddingHeader';
import WeddingNav from '@/components/WeddingNav';
import FileImport from '@/components/FileImport';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Vendor } from '@/types/wedding';
import { vendorTypes } from '@/types/wedding';

const emptyVendor: Omit<Vendor, 'id'> = {
  name: '', type: 'צלם', phone: '', price: 0, paid: 0, status: 'בתהליך', notes: '',
};

const statusColors: Record<Vendor['status'], string> = {
  'בתהליך': 'bg-amber-50 text-amber-700 border-amber-200/70',
  'סגור': 'bg-sky-50 text-sky-700 border-sky-200/70',
  'שולם': 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  'בוטל': 'bg-rose-50 text-rose-700 border-rose-200/70',
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

  // Migrate old vendors without 'paid' field
  const migratedVendors = vendors.map(v => ({
    ...v,
    paid: v.paid ?? 0,
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
    <div className="min-h-screen">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-10 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary/70 font-body mb-1">Vendors</p>
            <h2 className="text-3xl md:text-4xl font-display font-light text-gradient-gold">ניהול ספקים</h2>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {migratedVendors.length} ספקים רשומים
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

        {/* Budget Summary */}
        {totalBudget > 0 && (
          <div className="luxe-card">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-light/30 via-transparent to-blush/20" />
            <div className="relative px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">תקציב כולל</p>
                    <p className="font-display text-xl tabular-nums">₪{totalBudget.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">שולם עד כה</p>
                    <p className="font-display text-xl tabular-nums">₪{paidTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between items-baseline text-sm font-body">
                  <span className="text-muted-foreground">התקדמות תשלומים</span>
                  <span className="font-display text-lg text-gradient-gold tabular-nums">{paidPercent.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-primary via-primary/90 to-primary/70 transition-all duration-700 ease-out"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, סוג או טלפון..."
            className="pr-11 h-12 rounded-2xl bg-card/80 backdrop-blur-sm border-border/60 shadow-soft focus-visible:ring-primary/30"
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
              <div key={vendor.id} className="luxe-card animate-fade-in">
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-lg">{vendor.name}</p>
                        <Badge variant="outline" className="text-[10px] tracking-wider font-body bg-muted/60">{vendor.type}</Badge>
                        <Badge variant="outline" className={`text-[10px] tracking-wider font-body ${statusColors[vendor.status]}`}>{vendor.status}</Badge>
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
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => handleEdit(vendor)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10" onClick={() => handleDelete(vendor.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Vendors;
