export interface Guest {
  id: string;
  name: string;
  phone: string;
  numberOfGuests: number;
  side: 'חתן' | 'כלה' | 'משותף';
  status: 'ממתין' | 'מאשר' | 'לא מגיע';
  notes: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: string;
  phone: string;
  price: number;
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
