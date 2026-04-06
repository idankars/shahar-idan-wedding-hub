import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit2, Search, ArrowDownAZ, Clock, X } from 'lucide-react';
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
import { defaultSides } from '@/types/wedding';

const CUSTOM_SIDES_KEY = 'wedding-custom-sides';
const loadCustomSides = (): string[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_SIDES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};
const saveCustomSides = (sides: string[]) => {
  try {
    localStorage.setItem(CUSTOM_SIDES_KEY, JSON.stringify(sides));
  } catch {
    // ignore
  }
};

const emptyGuest: Omit<Guest, 'id'> = {
  name: '', phone: '', numberOfGuests: 1, side: 'משותף', status: 'ממתין', notes: '',
};

const statusColors: Record<Guest['status'], string> = {
  'ממתין': 'bg-muted text-muted-foreground',
  'מאשר': 'bg-secondary text-secondary-foreground',
  'לא מגיע': 'bg-accent text-accent-foreground',
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
  const statusMap: Record<string, Guest['status']> = { 'ממתין': 'ממתין', 'מאשר': 'מאשר', 'לא מגיע': 'לא מגיע' };
  return {
    name: row.name,
    phone: row.phone || '',
    numberOfGuests: parseInt(row.numberOfGuests) || 1,
    side: row.side?.trim() || 'משותף',
    status: statusMap[row.status] || 'ממתין',
    notes: row.notes || '',
  };
};

// ── Smart auto-detection for guests CSV/Excel ───────────────────────────────
// Sniffs values column-by-column and figures out which one is name/phone/etc.
// Works even when there are no headers, headers are weird, or columns are reordered.
const PHONE_RE = /(?:\+?972[-\s]?|0)5\d[-\s]?\d{3}[-\s]?\d{4}|^\d{9,11}$/;
const SIDE_TOKENS = ['חתן', 'כלה', 'משותף', 'הורי', 'groom', 'bride', 'shared', 'parents'];
const STATUS_TOKENS: Record<string, Guest['status']> = {
  'מאשר': 'מאשר', 'מאשרים': 'מאשר', 'מגיע': 'מאשר', 'מאושר': 'מאשר', 'כן': 'מאשר', 'yes': 'מאשר', 'confirmed': 'מאשר', 'v': 'מאשר', '✓': 'מאשר',
  'לא': 'לא מגיע', 'לא מגיע': 'לא מגיע', 'מסרב': 'לא מגיע', 'no': 'לא מגיע', 'declined': 'לא מגיע', 'x': 'לא מגיע',
  'ממתין': 'ממתין', 'אולי': 'ממתין', 'maybe': 'ממתין', 'pending': 'ממתין', '?': 'ממתין',
};
const SIDE_MAP: Record<string, string> = {
  'חתן': 'חתן', 'groom': 'חתן',
  'כלה': 'כלה', 'bride': 'כלה',
  'משותף': 'משותף', 'shared': 'משותף', 'both': 'משותף', 'משותפים': 'משותף',
};

const isProbablyHeader = (row: string[]): boolean => {
  if (!row || row.length === 0) return false;
  const text = row.join(' ').toLowerCase();
  if (/שם|name|טלפון|phone|אורח|guest|צד|side|סטטוס|status|הערות|note/.test(text)) return true;
  // Header rows usually have no numbers
  const hasDigit = row.some((c) => /\d/.test(c));
  return !hasDigit;
};

const normalizePhone = (s: string): string => s.replace(/[^\d+]/g, '');

const detectColumnTypes = (rows: string[][]): { name: number; phone: number; count: number; side: number; status: number; notes: number } => {
  const numCols = Math.max(...rows.map((r) => r.length), 0);
  const types = { name: -1, phone: -1, count: -1, side: -1, status: -1, notes: -1 };

  type ColScore = { phone: number; count: number; side: number; status: number; nameLikelihood: number; avgLen: number; nonEmpty: number };
  const scores: ColScore[] = [];

  for (let c = 0; c < numCols; c++) {
    const values = rows.map((r) => (r[c] ?? '').trim()).filter(Boolean);
    const total = values.length || 1;
    let phone = 0, count = 0, side = 0, status = 0;
    let totalLen = 0;
    let nameLikelihood = 0;

    for (const v of values) {
      const lower = v.toLowerCase();
      totalLen += v.length;

      // Phone: contains many digits or matches phone regex
      const digits = normalizePhone(v);
      if (PHONE_RE.test(v) || (digits.length >= 9 && digits.length <= 13)) phone++;
      // Count: small integer 1-30
      else if (/^\d{1,2}$/.test(v) && parseInt(v) <= 30 && parseInt(v) > 0) count++;

      if (SIDE_TOKENS.some((t) => lower.includes(t))) side++;
      if (Object.keys(STATUS_TOKENS).some((t) => lower === t || lower.includes(t))) status++;

      // Name: 2+ words, mostly letters, no digits
      if (!/\d/.test(v) && /[\u0590-\u05FFa-zA-Z]/.test(v) && v.split(/\s+/).length >= 1 && v.length >= 2 && v.length < 50) {
        nameLikelihood++;
      }
    }

    scores.push({
      phone: phone / total,
      count: count / total,
      side: side / total,
      status: status / total,
      nameLikelihood: nameLikelihood / total,
      avgLen: totalLen / total,
      nonEmpty: total,
    });
  }

  const pickBest = (key: keyof ColScore, threshold: number, exclude: number[]): number => {
    let best = -1, bestVal = threshold;
    scores.forEach((s, i) => {
      if (exclude.includes(i)) return;
      const v = s[key] as number;
      if (v > bestVal) { bestVal = v; best = i; }
    });
    return best;
  };

  types.phone = pickBest('phone', 0.5, []);
  types.count = pickBest('count', 0.5, [types.phone]);
  types.status = pickBest('status', 0.4, [types.phone, types.count]);
  types.side = pickBest('side', 0.4, [types.phone, types.count, types.status]);

  // Name = column with highest name likelihood among remaining
  const used = [types.phone, types.count, types.status, types.side].filter((x) => x >= 0);
  types.name = pickBest('nameLikelihood', 0.3, used);

  // Notes = remaining column with longest average text
  const usedAll = [...used, types.name].filter((x) => x >= 0);
  let bestNotes = -1, bestLen = 0;
  scores.forEach((s, i) => {
    if (usedAll.includes(i)) return;
    if (s.avgLen > bestLen && s.avgLen >= 5) { bestLen = s.avgLen; bestNotes = i; }
  });
  types.notes = bestNotes;

  return types;
};

const smartParseGuests = (rawRows: string[][]): Omit<Guest, 'id'>[] => {
  if (!rawRows || rawRows.length === 0) return [];
  // Drop fully empty rows
  let rows = rawRows.filter((r) => r.some((c) => c && c.trim()));
  if (rows.length === 0) return [];
  // Drop header row if detected
  if (isProbablyHeader(rows[0])) rows = rows.slice(1);
  if (rows.length === 0) return [];

  const cols = detectColumnTypes(rows);
  // Must at least find a name column
  if (cols.name < 0) return [];

  const out: Omit<Guest, 'id'>[] = [];
  for (const r of rows) {
    const name = (r[cols.name] ?? '').trim();
    if (!name || /\d{4,}/.test(name)) continue; // skip if name is mostly digits

    const phoneRaw = cols.phone >= 0 ? (r[cols.phone] ?? '').trim() : '';
    const countRaw = cols.count >= 0 ? (r[cols.count] ?? '').trim() : '';
    const sideRaw = cols.side >= 0 ? (r[cols.side] ?? '').trim().toLowerCase() : '';
    const statusRaw = cols.status >= 0 ? (r[cols.status] ?? '').trim().toLowerCase() : '';
    const notesRaw = cols.notes >= 0 ? (r[cols.notes] ?? '').trim() : '';

    let side: string = sideRaw || 'משותף';
    for (const [key, val] of Object.entries(SIDE_MAP)) {
      if (sideRaw.includes(key)) { side = val; break; }
    }

    let status: Guest['status'] = 'ממתין';
    for (const [key, val] of Object.entries(STATUS_TOKENS)) {
      if (statusRaw === key || statusRaw.includes(key)) { status = val; break; }
    }

    out.push({
      name,
      phone: phoneRaw,
      numberOfGuests: parseInt(countRaw) || 1,
      side,
      status,
      notes: notesRaw,
    });
  }
  return out;
};

const Guests = () => {
  const [guests, setGuests] = useSupabaseTable<Guest>('guests');
  const [form, setForm] = useState<Omit<Guest, 'id'>>(emptyGuest);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortAlpha, setSortAlpha] = useState(false);
  const [customSides, setCustomSides] = useState<string[]>(() => loadCustomSides());
  const [newSideOpen, setNewSideOpen] = useState(false);
  const [newSideName, setNewSideName] = useState('');

  // Persist custom sides to localStorage
  useEffect(() => {
    saveCustomSides(customSides);
  }, [customSides]);

  // All available sides = defaults + custom + any unique sides found in existing guests
  const allSides = useMemo(() => {
    const set = new Set<string>([...defaultSides, ...customSides]);
    guests.forEach((g) => g.side && set.add(g.side));
    return Array.from(set);
  }, [customSides, guests]);

  const handleAddCustomSide = () => {
    const name = newSideName.trim();
    if (!name) return;
    if (!customSides.includes(name) && !defaultSides.includes(name as typeof defaultSides[number])) {
      setCustomSides([...customSides, name]);
    }
    setForm((f) => ({ ...f, side: name }));
    setNewSideName('');
    setNewSideOpen(false);
  };

  const handleRemoveCustomSide = (side: string) => {
    setCustomSides(customSides.filter((s) => s !== side));
  };

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

  const filtered = useMemo(() => {
    const list = guests.filter((g) => g.name.includes(search) || g.phone.includes(search));
    if (sortAlpha) {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'he'));
    }
    return list;
  }, [guests, search, sortAlpha]);

  const totalAttending = guests.filter(g => g.status === 'מאשר').reduce((s, g) => s + g.numberOfGuests, 0);

  return (
    <div className="min-h-screen">
      <WeddingHeader />
      <WeddingNav />

      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-display">רשימת מוזמנים</h2>
            <p className="text-sm text-muted-foreground font-body">
              {guests.length} מוזמנים · {totalAttending} מאשרים הגעה
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <FileImport<Omit<Guest, 'id'>>
              onImport={handleImport}
              columnMapping={guestColumnMapping}
              parseRow={parseGuestRow}
              smartParse={smartParseGuests}
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
                      <Select
                        value={form.side}
                        onValueChange={(v) => {
                          if (v === '__add__') {
                            setNewSideOpen(true);
                          } else {
                            setForm({ ...form, side: v });
                          }
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {allSides.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                          <SelectItem value="__add__" className="text-primary">
                            + הוסף קטגוריה חדשה
                          </SelectItem>
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

        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם או טלפון..."
              className="pr-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSortAlpha(!sortAlpha)}
            className="gap-2 shrink-0"
            title={sortAlpha ? 'מסודר לפי א-ב — לחץ לסידור לפי הוספה' : 'לחץ לסידור לפי א-ב'}
          >
            {sortAlpha ? <ArrowDownAZ className="h-4 w-4 text-primary" /> : <Clock className="h-4 w-4" />}
            <span className="hidden sm:inline text-sm">{sortAlpha ? 'א-ב' : 'לפי הוספה'}</span>
          </Button>
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
            <Card key={guest.id} className="animate-fade-in hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{guest.name}</p>
                    <Badge variant="outline" className={statusColors[guest.status]}>{guest.status}</Badge>
                    <Badge variant="outline" className="text-xs bg-primary/5">{guest.side}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {guest.phone && <span dir="ltr">{guest.phone}</span>}
                    <span>{guest.numberOfGuests} אורחים</span>
                    {guest.notes && <span>· {guest.notes}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(guest)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(guest.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Add custom side dialog */}
      <Dialog open={newSideOpen} onOpenChange={setNewSideOpen}>
        <DialogContent className="font-body sm:max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-display">קטגוריית צד חדשה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>שם הקטגוריה</Label>
              <Input
                value={newSideName}
                onChange={(e) => setNewSideName(e.target.value)}
                placeholder="לדוגמה: דודים שחר, חברי עבודה..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomSide(); }}
                autoFocus
              />
            </div>
            {customSides.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">קטגוריות מותאמות קיימות</Label>
                <div className="flex flex-wrap gap-1.5">
                  {customSides.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="gap-1 pr-2 pl-1 py-1 bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      {s}
                      <button
                        onClick={() => handleRemoveCustomSide(s)}
                        className="rounded-full hover:bg-destructive/20 p-0.5"
                        title="הסר"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ביטול</Button>
            </DialogClose>
            <Button onClick={handleAddCustomSide} disabled={!newSideName.trim()}>הוסף</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Guests;
