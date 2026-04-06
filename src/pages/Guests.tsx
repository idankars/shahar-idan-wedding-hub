import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Edit2, Search, ArrowDownAZ, Clock, X, List, Columns3, ChevronLeft, ChevronRight, MoveRight, ClipboardPaste, GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
import type { Guest } from '@/types/wedding';
import { defaultSides } from '@/types/wedding';

const CUSTOM_SIDES_KEY = 'wedding-custom-sides';
const COLUMN_ORDER_KEY = 'wedding-column-order';
const VIEW_MODE_KEY = 'wedding-guest-view-mode';

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const saveJSON = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const loadCustomSides = (): string[] => loadJSON<string[]>(CUSTOM_SIDES_KEY, []);
const saveCustomSides = (s: string[]) => saveJSON(CUSTOM_SIDES_KEY, s);

const emptyGuest: Omit<Guest, 'id'> = {
  name: '', phone: '', numberOfGuests: 1, side: 'משותף', status: 'ממתין', notes: '',
};

const statusColors: Record<Guest['status'], string> = {
  'ממתין': 'bg-muted text-muted-foreground',
  'מאשר': 'bg-secondary text-secondary-foreground',
  'לא מגיע': 'bg-accent text-accent-foreground',
};

// Vibrant color palette for board columns — each side gets a distinct color
const sidePalette = [
  { bg: 'bg-rose-50', border: 'border-rose-200', headerBg: 'bg-rose-100/80', headerText: 'text-rose-700', cardBorder: 'border-rose-200/60', dragBg: 'bg-rose-100', dragBorder: 'border-rose-400' },
  { bg: 'bg-sky-50', border: 'border-sky-200', headerBg: 'bg-sky-100/80', headerText: 'text-sky-700', cardBorder: 'border-sky-200/60', dragBg: 'bg-sky-100', dragBorder: 'border-sky-400' },
  { bg: 'bg-amber-50', border: 'border-amber-200', headerBg: 'bg-amber-100/80', headerText: 'text-amber-700', cardBorder: 'border-amber-200/60', dragBg: 'bg-amber-100', dragBorder: 'border-amber-400' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', headerBg: 'bg-emerald-100/80', headerText: 'text-emerald-700', cardBorder: 'border-emerald-200/60', dragBg: 'bg-emerald-100', dragBorder: 'border-emerald-400' },
  { bg: 'bg-violet-50', border: 'border-violet-200', headerBg: 'bg-violet-100/80', headerText: 'text-violet-700', cardBorder: 'border-violet-200/60', dragBg: 'bg-violet-100', dragBorder: 'border-violet-400' },
  { bg: 'bg-pink-50', border: 'border-pink-200', headerBg: 'bg-pink-100/80', headerText: 'text-pink-700', cardBorder: 'border-pink-200/60', dragBg: 'bg-pink-100', dragBorder: 'border-pink-400' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', headerBg: 'bg-cyan-100/80', headerText: 'text-cyan-700', cardBorder: 'border-cyan-200/60', dragBg: 'bg-cyan-100', dragBorder: 'border-cyan-400' },
  { bg: 'bg-orange-50', border: 'border-orange-200', headerBg: 'bg-orange-100/80', headerText: 'text-orange-700', cardBorder: 'border-orange-200/60', dragBg: 'bg-orange-100', dragBorder: 'border-orange-400' },
  { bg: 'bg-lime-50', border: 'border-lime-200', headerBg: 'bg-lime-100/80', headerText: 'text-lime-700', cardBorder: 'border-lime-200/60', dragBg: 'bg-lime-100', dragBorder: 'border-lime-400' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', headerBg: 'bg-fuchsia-100/80', headerText: 'text-fuchsia-700', cardBorder: 'border-fuchsia-200/60', dragBg: 'bg-fuchsia-100', dragBorder: 'border-fuchsia-400' },
  { bg: 'bg-teal-50', border: 'border-teal-200', headerBg: 'bg-teal-100/80', headerText: 'text-teal-700', cardBorder: 'border-teal-200/60', dragBg: 'bg-teal-100', dragBorder: 'border-teal-400' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', headerBg: 'bg-indigo-100/80', headerText: 'text-indigo-700', cardBorder: 'border-indigo-200/60', dragBg: 'bg-indigo-100', dragBorder: 'border-indigo-400' },
];

const sideBadgeColors = [
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-lime-100 text-lime-700 border-lime-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
];

const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const colorForSide = (side: string) => sidePalette[hashStr(side) % sidePalette.length];
const badgeForSide = (side: string) => sideBadgeColors[hashStr(side) % sideBadgeColors.length];

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
  const [viewMode, setViewMode] = useState<'list' | 'table'>(() => loadJSON<'list' | 'table'>(VIEW_MODE_KEY, 'list'));
  const [columnOrder, setColumnOrder] = useState<string[]>(() => loadJSON<string[]>(COLUMN_ORDER_KEY, []));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [dragOverSide, setDragOverSide] = useState<string | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [tableContentWidth, setTableContentWidth] = useState(0);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSide, setBulkSide] = useState<string>('משותף');

  // Persist
  useEffect(() => { saveCustomSides(customSides); }, [customSides]);
  useEffect(() => { saveJSON(VIEW_MODE_KEY, viewMode); }, [viewMode]);
  useEffect(() => { saveJSON(COLUMN_ORDER_KEY, columnOrder); }, [columnOrder]);

  const scrollTable = (dir: -1 | 1) => {
    const el = tableScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  // All available sides = defaults + custom + any unique sides found in existing guests
  const allSides = useMemo(() => {
    const set = new Set<string>([...defaultSides, ...customSides]);
    guests.forEach((g) => g.side && set.add(g.side));
    return Array.from(set);
  }, [customSides, guests]);

  // Effective column order: saved order first, then any new sides appended
  const orderedSides = useMemo(() => {
    const known = new Set(allSides);
    const inOrder = columnOrder.filter((s) => known.has(s));
    const rest = allSides.filter((s) => !inOrder.includes(s));
    return [...inOrder, ...rest];
  }, [allSides, columnOrder]);

  // Sync top & bottom scrollbars for table view
  useEffect(() => {
    if (viewMode !== 'table') return;
    const bottom = tableScrollRef.current;
    const top = topScrollRef.current;
    if (!bottom || !top) return;

    // Measure once after render
    const measure = () => {
      try {
        setTableContentWidth(bottom.scrollWidth);
      } catch {
        /* ignore */
      }
    };
    const t = window.setTimeout(measure, 0);

    let isSyncing = false;
    const onBottom = () => {
      if (isSyncing) return;
      isSyncing = true;
      top.scrollLeft = bottom.scrollLeft;
      window.requestAnimationFrame(() => { isSyncing = false; });
    };
    const onTop = () => {
      if (isSyncing) return;
      isSyncing = true;
      bottom.scrollLeft = top.scrollLeft;
      window.requestAnimationFrame(() => { isSyncing = false; });
    };
    bottom.addEventListener('scroll', onBottom, { passive: true });
    top.addEventListener('scroll', onTop, { passive: true });
    return () => {
      window.clearTimeout(t);
      bottom.removeEventListener('scroll', onBottom);
      top.removeEventListener('scroll', onTop);
    };
  }, [viewMode, orderedSides.length, guests.length]);

  const moveColumn = (side: string, dir: -1 | 1) => {
    const idx = orderedSides.indexOf(side);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= orderedSides.length) return;
    const next = [...orderedSides];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setColumnOrder(next);
  };

  // ── Multi-select & bulk move ──
  const toggleSelect = (id: string, shiftKey = false, orderedIds?: string[]) => {
    if (shiftKey && lastSelectedId && orderedIds && orderedIds.includes(lastSelectedId) && orderedIds.includes(id)) {
      const a = orderedIds.indexOf(lastSelectedId);
      const b = orderedIds.indexOf(id);
      const [start, end] = a < b ? [a, b] : [b, a];
      const range = orderedIds.slice(start, end + 1);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        range.forEach((r) => next.add(r));
        return next;
      });
      setLastSelectedId(id);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setLastSelectedId(id);
  };
  const clearSelection = () => { setSelectedIds(new Set()); setLastSelectedId(null); };
  const moveSelectedTo = (side: string) => {
    if (selectedIds.size === 0) return;
    setGuests(guests.map((g) => (selectedIds.has(g.id) ? { ...g, side } : g)));
    clearSelection();
  };

  // ── Drag handlers ──
  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    // If dragging a non-selected card, replace selection with just this one
    if (!selectedIds.has(guestId)) {
      setSelectedIds(new Set([guestId]));
    }
    e.dataTransfer.effectAllowed = 'move';
    // Set a payload so DnD works in all browsers
    e.dataTransfer.setData('text/plain', guestId);
  };
  const handleColumnDragOver = (e: React.DragEvent, side: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSide !== side) setDragOverSide(side);
  };
  const handleColumnDragLeave = () => setDragOverSide(null);
  const handleColumnDrop = (e: React.DragEvent, side: string) => {
    e.preventDefault();
    setDragOverSide(null);
    // If selection is empty (rare), use the dragged ID from payload
    const draggedId = e.dataTransfer.getData('text/plain');
    if (selectedIds.size === 0 && draggedId) {
      setGuests(guests.map((g) => (g.id === draggedId ? { ...g, side } : g)));
    } else {
      moveSelectedTo(side);
    }
  };

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

  const handleBulkPaste = () => {
    const lines = bulkText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const newGuests: Guest[] = [];
    for (const line of lines) {
      // Split by tab, comma, or multiple spaces
      const parts = line.split(/\t|,|\s{2,}/).map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) continue;
      // Find a phone-looking part
      let name = '';
      let phone = '';
      let count = 1;
      for (const p of parts) {
        const digits = normalizePhone(p);
        if (!phone && (PHONE_RE.test(p) || (digits.length >= 9 && digits.length <= 13))) {
          phone = p;
        } else if (!name && /[\u0590-\u05FFa-zA-Z]/.test(p)) {
          name = p;
        } else if (/^\d{1,2}$/.test(p) && parseInt(p) <= 30) {
          count = parseInt(p);
        } else if (name) {
          name += ' ' + p;
        }
      }
      if (!name) name = parts[0];
      if (!name) continue;
      newGuests.push({
        id: crypto.randomUUID(),
        name,
        phone,
        numberOfGuests: count,
        side: bulkSide,
        status: 'ממתין',
        notes: '',
      });
    }
    if (newGuests.length > 0) {
      setGuests([...guests, ...newGuests]);
    }
    setBulkText('');
    setBulkOpen(false);
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

  const totalAttending = guests.filter(g => g.status === 'מאשר').reduce((s, g) => s + (g.numberOfGuests || 1), 0);
  const totalPeople = guests.reduce((s, g) => s + (g.numberOfGuests || 1), 0);
  const listIds = useMemo(() => filtered.map((g) => g.id), [filtered]);

  return (
    <div className="min-h-screen relative">
      <FloatingPhotos count={5} seed={23} />
      <WeddingHeader />
      <WeddingNav />

      <main className={`container mx-auto py-8 px-4 space-y-6 relative ${viewMode === 'table' ? 'max-w-none' : 'max-w-4xl'}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-display">רשימת מוזמנים</h2>
            <p className="text-sm text-muted-foreground font-body">
              {guests.length} שורות · {totalPeople} סה״כ אנשים · {totalAttending} מאשרים הגעה
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

        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
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
          <Button
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="gap-2 shrink-0"
            title="הוספה מרובה — הדבק רשימה של שמות"
          >
            <ClipboardPaste className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">הדבק רשימה</span>
          </Button>
          <div className="flex rounded-md border bg-card overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              title="תצוגת רשימה"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              title="תצוגת טבלה לפי קטגוריות"
            >
              <Columns3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="sticky top-2 z-20 flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 backdrop-blur-sm animate-fade-in">
            <span className="text-sm font-medium">{selectedIds.size} נבחרו</span>
            <Select onValueChange={(v) => moveSelectedTo(v)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <div className="flex items-center gap-1.5">
                  <MoveRight className="h-3.5 w-3.5" />
                  <SelectValue placeholder="העבר לקטגוריה..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {allSides.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={clearSelection} className="h-7 gap-1">
              <X className="h-3.5 w-3.5" />
              נקה
            </Button>
            <span className="text-xs text-muted-foreground hidden md:inline mr-auto">טיפ: Shift+קליק לבחירת טווח · גרור כרטיסים להעברה</span>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-2">
            {filtered.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground font-body">
                  {guests.length === 0 ? 'עדיין אין מוזמנים. הוסיפו את המוזמן הראשון או ייבאו מקובץ!' : 'לא נמצאו תוצאות'}
                </CardContent>
              </Card>
            )}
            {filtered.map((guest) => {
              const isSelected = selectedIds.has(guest.id);
              return (
                <Card
                  key={guest.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, guest.id)}
                  onClick={(e) => {
                    if (e.shiftKey) {
                      e.preventDefault();
                      window.getSelection()?.removeAllRanges();
                      toggleSelect(guest.id, true, listIds);
                    }
                  }}
                  className={`animate-fade-in hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none ${isSelected ? 'ring-2 ring-primary border-primary/50' : ''}`}
                >
                  <CardContent className="flex items-center justify-between py-4 gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(guest.id, false, listIds)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if ((e as React.MouseEvent).shiftKey) {
                            e.preventDefault();
                            toggleSelect(guest.id, true, listIds);
                          }
                        }}
                      />
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{guest.name}</p>
                          <Badge variant="outline" className={statusColors[guest.status]}>{guest.status}</Badge>
                          <Badge variant="outline" className={`text-xs ${badgeForSide(guest.side)}`}>{guest.side}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {guest.phone && <span dir="ltr">{guest.phone}</span>}
                          <span>{guest.numberOfGuests} אורחים</span>
                          {guest.notes && <span>· {guest.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(guest)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(guest.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {viewMode === 'table' && (
          <div className="relative -mx-4">
            {/* Top scrollbar (mirrors bottom) */}
            <div
              ref={topScrollRef}
              className="overflow-x-auto overflow-y-hidden mx-4"
              style={{ height: 14 }}
            >
              <div style={{ width: tableContentWidth, height: 1 }} />
            </div>

            {/* Left arrow */}
            <button
              onClick={() => scrollTable(-1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-md hover:bg-card hover:shadow-lg transition-all flex items-center justify-center text-foreground"
              title="גלול ימינה"
              aria-label="גלול ימינה"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Right arrow */}
            <button
              onClick={() => scrollTable(1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-md hover:bg-card hover:shadow-lg transition-all flex items-center justify-center text-foreground"
              title="גלול שמאלה"
              aria-label="גלול שמאלה"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div ref={tableScrollRef} className="overflow-x-auto px-4 pb-4 pt-1">
              <div className="flex gap-3 min-w-min">
              {orderedSides.map((side, idx) => {
                const colGuests = filtered.filter((g) => g.side === side);
                const colIds = colGuests.map((g) => g.id);
                const isOver = dragOverSide === side;
                const c = colorForSide(side);
                return (
                  <div
                    key={side}
                    onDragOver={(e) => handleColumnDragOver(e, side)}
                    onDragLeave={handleColumnDragLeave}
                    onDrop={(e) => handleColumnDrop(e, side)}
                    className={`w-64 shrink-0 rounded-xl border-2 transition-all ${isOver ? `${c.dragBg} ${c.dragBorder} scale-[1.02] shadow-lg` : `${c.bg} ${c.border}`}`}
                  >
                    <div className={`flex items-center justify-between gap-1 px-3 py-2 border-b ${c.border} ${c.headerBg} rounded-t-xl`}>
                      <button
                        onClick={() => moveColumn(side, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30"
                        title="הזז ימינה"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex-1 text-center">
                        <p className={`text-sm font-bold truncate ${c.headerText}`}>{side}</p>
                        <p className={`text-xs ${c.headerText} opacity-70`}>{colGuests.length}</p>
                      </div>
                      <button
                        onClick={() => moveColumn(side, 1)}
                        disabled={idx === orderedSides.length - 1}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30"
                        title="הזז שמאלה"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-2 space-y-2 min-h-[120px]">
                      {colGuests.length === 0 && (
                        <p className="text-xs text-muted-foreground/60 text-center py-6">גרור לכאן</p>
                      )}
                      {colGuests.map((guest) => {
                        const isSelected = selectedIds.has(guest.id);
                        return (
                          <div
                            key={guest.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, guest.id)}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                e.preventDefault();
                                window.getSelection()?.removeAllRanges();
                                toggleSelect(guest.id, true, colIds);
                              }
                            }}
                            className={`bg-white border rounded-lg p-2.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${isSelected ? 'ring-2 ring-primary border-primary/50' : c.cardBorder}`}
                          >
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelect(guest.id, false, colIds)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if ((e as React.MouseEvent).shiftKey) {
                                    e.preventDefault();
                                    toggleSelect(guest.id, true, colIds);
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{guest.name}</p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${statusColors[guest.status]}`}>
                                    {guest.status}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">{guest.numberOfGuests} אורחים</span>
                                </div>
                                {guest.phone && <p className="text-[10px] text-muted-foreground mt-0.5" dir="ltr">{guest.phone}</p>}
                              </div>
                              <button
                                onClick={() => handleEdit(guest)}
                                className="text-muted-foreground hover:text-foreground p-0.5"
                                title="ערוך"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setNewSideOpen(true)}
                className="w-64 shrink-0 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary min-h-[200px]"
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">הוסף קטגוריה</span>
              </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bulk paste dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="font-body sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-display">הוספה מרובה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              הדבק רשימה של מוזמנים — שורה לכל אחד. אפשר לכלול גם טלפון ומספר אורחים, מופרדים ברווח/פסיק/טאב.
            </p>
            <div className="grid gap-2">
              <Label>קטגוריה לכולם</Label>
              <Select value={bulkSide} onValueChange={setBulkSide}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allSides.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>רשימה</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={'יוסי כהן\nרחל לוי, 0501234567\nדני אבני 0521112222 2'}
                className="min-h-[180px] font-mono text-sm"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground">
                {bulkText.split(/\r?\n/).filter((l) => l.trim()).length} שורות יתווספו
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">ביטול</Button>
            </DialogClose>
            <Button onClick={handleBulkPaste} disabled={!bulkText.trim()}>
              הוסף הכל
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
