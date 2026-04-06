export interface Guest {
  id: string;
  name: string;
  phone: string;
  numberOfGuests: number;
  side: string;
  status: 'ממתין' | 'מאשר' | 'לא מגיע';
  notes: string;
}

export const defaultSides = ['חתן', 'כלה', 'משותף', 'הורי שחר', 'הורי עידן'] as const;

export interface Vendor {
  id: string;
  name: string;
  type: string;
  phone: string;
  price: number;
  paid: number;
  status: 'בתהליך' | 'סגור' | 'שולם' | 'בוטל';
  notes: string;
}

export const vendorTypes = [
  'צלם',
  'DJ',
  'קייטרינג',
  'עיצוב',
  'הזמנות',
  'רב',
  'איפור ושיער',
  'שמלה/חליפה',
  'הסעות',
  'וידאו',
  'להקה/זמר',
  'עוגה',
  'אחר',
] as const;
