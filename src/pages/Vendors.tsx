import { useState } from 'react';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Vendor } from '@/types/wedding';
import { vendorTypes } from '@/types/wedding';

const emptyVendor: Omit<Vendor, 'id'> = {
  name: '', type: 'צלם', phone: '', price: 0, status: 'בתהליך', notes: '',
};

const statusColors: Record<Vendor['status'], string> = {
  'בתהליך': 'bg-muted text-muted-foreground',
  'סגור': 'bg-gold-light text-foreground',
  'שולם': 'bg-secondary text-secondary-foreground',
  'בוטל': 'bg-accent text-accent-foreground',
};

const vendorColumnMapping = {
  name: ['שם', 'name', 'שם הספק', 'ספק'],
  type: ['סוג', 'type', 'קטגוריה', 'תחום'],
  phone: ['טלפון', 'phone', 'נייד', 'tel'],
  price: ['מחיר', 'price', 'עלות', 'סכום'],
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
    status: statusMap[row.status] || 'בתהליך',
    notes: row.notes || '',
  };
};

const Vendors = () => {
  const [vendors, setVendors] = useLocalStorage<Vendor[]>('wedding-vendors', []);
  const [form, setForm] = useState<Omit<Vendor, 'id'>>(emptyVendor);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setVendors(vendors.map((v) => (v.id === editId ? { ...form, id: editId } : v)));
    } else {
      setVendors([...vendors, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyVendor);
    setEditId(null);
    setOpen(false);
  };

  const handleEdit = (vendor: Vendor) => {
    const { id, ...rest } = vendor;
    setForm(rest);
    setEditId(id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setVendors(vendors.filter((v) => v.id !== id));
  };

  const handleImport = (items: Omit<Vendor, 'id'>[]) => {
    const newVendors = items.map((item) => ({ ...item, id: crypto.randomUUID() }));
    setVendors([...vendors, ...newVendors]);
  };

  const filtered = vendors.filter((v) =>
    v.name.includes(search) || v.type.includes(search) || v.phone.includes(search)
  );

  const totalBudget = vendors.reduce((s, v) => s + v.price, 0);
  const paidTotal = vendors.filter(v => v.status === 'שולם').reduce((s, v) => s + v.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-display">ניהול ספקים</h2>
            <p className="text-sm text-muted-foreground font-body">
              {vendors.length} ספקים · תקציב: ₪{totalBudget.toLocaleString()} · שולם: ₪{paidTotal.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <FileImport<Omit<Vendor, 'id'>>
              onImport={handleImport}
              columnMapping={vendorColumnMapping}
              parseRow={parseVendorRow}
              label="ספקים"
              templateHeaders={['שם הספק', 'סוג', 'טלפון', 'מחיר', 'סטטוס', 'הערות']}
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
                      <Label>מחיר (₪)</Label>
                      <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} dir="ltr" />
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

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, סוג או טלפון..."
            className="pr-10"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground font-body">
                {vendors.length === 0 ? 'עדיין אין ספקים. הוסיפו את הספק הראשון או ייבאו מקובץ!' : 'לא נמצאו תוצאות'}
              </CardContent>
            </Card>
          )}
          {filtered.map((vendor) => (
            <Card key={vendor.id} className="animate-fade-in hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{vendor.name}</p>
                    <Badge variant="outline">{vendor.type}</Badge>
                    <Badge variant="outline" className={statusColors[vendor.status]}>{vendor.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {vendor.phone && <span dir="ltr">{vendor.phone}</span>}
                    <span>₪{vendor.price.toLocaleString()}</span>
                    {vendor.notes && <span>· {vendor.notes}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(vendor)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(vendor.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Vendors;
