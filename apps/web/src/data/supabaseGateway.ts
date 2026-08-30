import type { SupabaseClient } from '@supabase/supabase-js';
import type { ImportReceipt } from './learningProgressRepository';
import type { ImportReceiptRow, LearningEventRow, LearningProgressGateway } from './supabaseLearningProgressRepository';

const unwrap = <T>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error('Supabase learning data request failed');
  if (result.data === null) throw new Error('Supabase learning data response was empty');
  return result.data;
};

export function createSupabaseGateway(client: SupabaseClient): LearningProgressGateway {
  return {
    async listEvents(userId, from, to) {
      const result = await client.from('learning_events')
        .select('id,user_id,track,event_type,occurred_at,local_day,payload')
        .eq('user_id', userId)
        .order('occurred_at', { ascending: true })
        .range(from, to);
      return unwrap(result) as LearningEventRow[];
    },
    async upsertEvents(rows) {
      const { error } = await client.from('learning_events').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
      if (error) throw new Error('Supabase learning event write failed');
    },
    async getSelectedTextbookId(userId) {
      const { data, error } = await client.from('learner_preferences')
        .select('selected_textbook_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new Error('Supabase preference read failed');
      return data?.selected_textbook_id ?? null;
    },
    async upsertSelectedTextbookId(userId, textbookId) {
      const { error } = await client.from('learner_preferences').upsert({
        user_id: userId,
        selected_textbook_id: textbookId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw new Error('Supabase preference write failed');
    },
    async getImportReceipt(userId, sourceKey) {
      const { data, error } = await client.from('local_progress_imports')
        .select('source_key,source_version,event_count,imported_at')
        .eq('user_id', userId)
        .eq('source_key', sourceKey)
        .maybeSingle();
      if (error) throw new Error('Supabase import receipt read failed');
      return data as ImportReceiptRow | null;
    },
    async upsertImportReceipt(userId, receipt: Omit<ImportReceipt, 'importedAt'>) {
      const { error } = await client.from('local_progress_imports').upsert({
        user_id: userId,
        source_key: receipt.sourceKey,
        source_version: receipt.sourceVersion,
        event_count: receipt.eventCount,
        imported_at: new Date().toISOString(),
      }, { onConflict: 'user_id,source_key' });
      if (error) throw new Error('Supabase import receipt write failed');
    },
    async findEventIds(userId, ids) {
      const { data, error } = await client.from('learning_events').select('id').eq('user_id', userId).in('id', ids);
      if (error) throw new Error('Supabase event verification failed');
      return (data ?? []).map(row => row.id as string);
    },
  };
}
