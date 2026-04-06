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
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Guest } from '@/types/wedding';

const emptyGuest: Omit<Guest, 'id'> = {
  name: '', phone: '', numberOfGuests: 1, side: 'משותף', status: 'ממתין', notes: '',
};

const statusColors: Record<Guest['status'], string> = {
  'ממתין': 'bg-amber-50 text-amber-700 border-amber-200/70',
  'מאשר': 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  'לא מגיע': 'bg-rose-50 text-rose-700 border-rose-200/70',
};

const guestColumnMapping = {
  name: ['שם', 'name', 'שם מלא', 'שם המוזמן'],
  phone: ['טלפון', 'phone', 'נייד', 'מספר טלפון', 'tel'],
  numberOfGuests: ['מספר אורחים', 'כמות', 'guests', 'number', 'מס אורחים', 'כמות אורחים'],
  side: ['צד', 'side', 'חתן/כלה'],
  status: ['סטטוס', 'status', 'אישור'],
  notes: ['הערות', 'notes', 'הערה'],
};

const parseGuestRow = (row: Record<string, string>): Omit<Guest, 'id'> | null => {
  if (!row.name) return null;
  const sideMap: Record<string, Guest['side']> = { 'חתן': 'חתן', 'כלה': 'כלה', 'משותף': 'משותף' };
  const statusMap: Record<string, Guest['status']> = { 'ממתין': 'ממתין', 'מאשר': 'מאשר', 'לא מגיע': 'לא מגיע' };
  return {
    name: row.name,
    phone: row.phone || '',
    numberOfGuests: parseInt(row.numberOfGuests) || 1,
    side: sideMap[row.side] || 'משותף',
    status: statusMap[row.status] || 'ממתין',
    notes: row.notes || '',
  };
};

const Guests = () => {
  const [guests, setGuests] = useSupabaseTable<Guest>('guests');
  const [form, setForm] = useState<Omit<Guest, 'id'>>(emptyGuest);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setGuests(guests.map((g) => (g.id === editId ? { ...form, id: editId } : g)));
    } else {
      setGuests([...guests, { ...form, id: crypto.randomUUID() }]);
    }
    setForm(emptyGuest);
    setEditId(null);
    setOpen(false);
  };

  const handleEdit = (guest: Guest) => {
    const { id, ...rest } = guest;
    setForm(rest);
    setEditId(id);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setGuests(guests.filter((g) => g.id !== id));
  };

  const handleImport = (items: Omit<Guest, 'id'>[]) => {
    const newGuests = items.map((item) => ({ ...item, id: crypto.randomUUID() }));
    setGuests([...guests, ...newGuests]);
  };

  const filtered = guests.filter((g) =>
    g.name.includes(search) || g.phone.includes(search)
  );

  const totalAttending = guests.filter(g => g.status === 'מאשר').reduce((s, g) => s + g.numberOfGuests, 0);

  return (
    <div className="min-h-screen">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-10 px-4 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-primary/70 font-body mb-1">Guests</p>
            <h2 className="text-3xl md:text-4xl font-display font-light text-gradient-gold">רשימת מוזמנים</h2>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {guests.length} מוזמנים · {totalAttending} מאשרים הגעה
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <FileImport<Omit<Guest, 'id'>>
              onImport={handleImport}
              columnMapping={guestColumnMapping}
              parseRow={parseGuestRow}
              label="מוזמנים"
              templateHeaders={['שם', 'טלפון', 'מספר אורחים', 'צד', 'סטטוס', 'הערות']}
            />
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setForm(emptyGuest); setEditId(null); } }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  הוסף מוזמן
                </Button>
              </DialogTrigger>
              <DialogContent className="font-body" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="font-display">{editId ? 'ערוך מוזמן' : 'מוזמן חדש'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>שם</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="שם מלא" />
                  </div>
                  <div className="grid gap-2">
                    <Label>טלפון</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="050-0000000" dir="ltr" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>מס׳ מוזמנים</Label>
                      <Input type="number" min={1} value={form.numberOfGuests} onChange={(e) => setForm({ ...form, numberOfGuests: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>צד</Label>
                      <Select value={form.side} onValueChange={(v) => setForm({ ...form, side: v as Guest['side'] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="חתן">חתן</SelectItem>
                          <SelectItem value="כלה">כלה</SelectItem>
                          <SelectItem value="משותף">משותף</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>סטטוס</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Guest['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ממתין">ממתין</SelectItem>
                        <SelectItem value="מאשר">מאשר</SelectItem>
                        <SelectItem value="לא מגיע">לא מגיע</SelectItem>
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

        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או טלפון..."
            className="pr-11 h-12 rounded-2xl bg-card/80 backdrop-blur-sm border-border/60 shadow-soft focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground font-body">
                {guests.length === 0 ? 'עדיין אין מוזמנים. הוסיפו את המוזמן הראשון או ייבאו מקובץ!' : 'לא נמצאו תוצאות'}
              </CardContent>
            </Card>
          )}
          {filtered.map((guest) => (
            <div key={guest.id} className="luxe-card animate-fade-in">
              <div className="flex items-center justify-between py-4 px-5 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-lg">{guest.name}</p>
                    <Badge variant="outline" className={`text-[10px] tracking-wider font-body ${statusColors[guest.status]}`}>{guest.status}</Badge>
                    <Badge variant="outline" className="text-[10px] tracking-wider font-body bg-muted/60">{guest.side}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5">
                    {guest.phone && <span dir="ltr" className="tabular-nums">{guest.phone}</span>}
                    <span>{guest.numberOfGuests} אורחים</span>
                    {guest.notes && <span className="text-muted-foreground/70">· {guest.notes}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10" onClick={() => handleEdit(guest)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10" onClick={() => handleDelete(guest.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Guests;
