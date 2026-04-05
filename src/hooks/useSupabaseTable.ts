import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabaseTable<T extends { id: string }>(table: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return;
    }
    setData((rows as T[]) ?? []);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, fetchData]);

  const setItems = useCallback(async (newData: T[] | ((prev: T[]) => T[])) => {
    const resolved = typeof newData === 'function' ? newData(data) : newData;

    // Find added items
    const existingIds = new Set(data.map(d => d.id));
    const added = resolved.filter(item => !existingIds.has(item.id));

    // Find removed items
    const newIds = new Set(resolved.map(d => d.id));
    const removed = data.filter(item => !newIds.has(item.id));

    // Find updated items
    const updated = resolved.filter(item => {
      if (!existingIds.has(item.id)) return false;
      const old = data.find(d => d.id === item.id);
      return JSON.stringify(old) !== JSON.stringify(item);
    });

    // Optimistic update
    setData(resolved);

    // Apply changes to Supabase
    if (added.length > 0) {
      const { error } = await supabase.from(table).insert(added);
      if (error) console.error(`Error inserting into ${table}:`, error);
    }

    if (removed.length > 0) {
      const { error } = await supabase.from(table).delete().in('id', removed.map(r => r.id));
      if (error) console.error(`Error deleting from ${table}:`, error);
    }

    for (const item of updated) {
      const { error } = await supabase.from(table).update(item).eq('id', item.id);
      if (error) console.error(`Error updating ${table}:`, error);
    }
  }, [table, data]);

  return [data, setItems, loading] as const;
}
